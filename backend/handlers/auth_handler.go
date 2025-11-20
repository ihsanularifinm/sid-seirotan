package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
	"golang.org/x/crypto/bcrypt"
)

// LoginRequest represents the request body for admin login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents the response body for successful admin login
type LoginResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}

// AuthHandler handles authentication related requests
type AuthHandler struct {
	UserRepository repositories.UserRepository
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(userRepo repositories.UserRepository) *AuthHandler {
	return &AuthHandler{UserRepository: userRepo}
}

// Login handles admin login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Username and password are required", err)
		return
	}

	// Get user from repository
	user, err := h.UserRepository.GetUserByUsername(req.Username)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	// --- DEBUGGING LOGS ---
	log.Printf("DEBUG: Password from login attempt for user '%s': %s", req.Username, req.Password)
	log.Printf("DEBUG: Hashed password from DB for user '%s': %s", user.Username, user.PasswordHash)
	// --- END DEBUGGING LOGS ---

	// Compare password with the hashed password from the database
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	// Generate JWT token including the user's role
	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to generate token", err)
		return
	}

	c.JSON(http.StatusOK, LoginResponse{Token: token, Role: string(user.Role)})
}

