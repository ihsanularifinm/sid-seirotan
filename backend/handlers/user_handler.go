package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"gorm.io/gorm"
)

// CreateUserPayload defines the expected input for creating a user
type CreateUserPayload struct {
	FullName string          `json:"full_name" binding:"required"`
	Username string          `json:"username" binding:"required"`
	Password string          `json:"password" binding:"required"`
	Role     models.UserRole `json:"role" binding:"required"`
}

// UpdateUserPayload defines the expected input for updating a user
type UpdateUserPayload struct {
	FullName string          `json:"full_name"`
	Username string          `json:"username"`
	Password string          `json:"password"` // Optional
	Role     models.UserRole `json:"role"`
}

// UserHandler handles user-related requests
type UserHandler struct {
	UserRepository repositories.UserRepository
}

// NewUserHandler creates a new UserHandler
func NewUserHandler(userRepo repositories.UserRepository) *UserHandler {
	return &UserHandler{UserRepository: userRepo}
}

// CreateUser creates a new user (Admin protected)
func (h *UserHandler) CreateUser(c *gin.Context) {
	var payload CreateUserPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	user := models.User{
		FullName: payload.FullName,
		Username: payload.Username,
		PasswordHash: payload.Password, // Will be hashed by repository
		Role:     payload.Role,
	}

	if err := h.UserRepository.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user", "details": err.Error()})
		return
	}

	// Clear password hash before sending response
	user.PasswordHash = ""
	c.JSON(http.StatusCreated, user)
}

// GetAllUsers retrieves all users (Admin protected)
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	requestingRoleStr, exists := c.Get("userRole")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: User role not found in token"})
		return
	}

	requestingRole := models.UserRole(requestingRoleStr.(string))

	users, err := h.UserRepository.GetAllUsers(requestingRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users", "details": err.Error()})
		return
	}

	// Clear password hashes before sending response
	for i := range users {
		users[i].PasswordHash = ""
	}
	c.JSON(http.StatusOK, users)
}

// GetUserByID retrieves a single user by ID (Admin protected)
func (h *UserHandler) GetUserByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.UserRepository.GetUserByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user", "details": err.Error()})
		return
	}

	user.PasswordHash = "" // Clear password hash
	c.JSON(http.StatusOK, user)
}

// UpdateUser updates an existing user (Admin protected)
func (h *UserHandler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var payload UpdateUserPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// Get requesting user's role from context
	requestingRole, exists := c.Get("userRole")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: User role not found in token"})
		return
	}

	// Fetch existing user to update
	existingUser, err := h.UserRepository.GetUserByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user for update", "details": err.Error()})
		return
	}

	// Business logic: Only superadmin can edit superadmin accounts
	if existingUser.Role == models.UserRoleSuperadmin && requestingRole.(models.UserRole) != models.UserRoleSuperadmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only superadmin can edit superadmin accounts"})
		return
	}

	// Update fields from payload
	if payload.FullName != "" {
		existingUser.FullName = payload.FullName
	}
	if payload.Username != "" {
		existingUser.Username = payload.Username
	}
	if payload.Password != "" {
		existingUser.PasswordHash = payload.Password // Will be hashed by repository
	}
	if payload.Role != "" {
		existingUser.Role = payload.Role
	}

	if err := h.UserRepository.UpdateUser(existingUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user", "details": err.Error()})
		return
	}

	existingUser.PasswordHash = "" // Clear password hash
	c.JSON(http.StatusOK, existingUser)
}

// DeleteUser deletes a user (Admin protected)
func (h *UserHandler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get requesting user's role from context
	requestingRole, exists := c.Get("userRole")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: User role not found in token"})
		return
	}

	// Business logic: Only superadmin can delete superadmin accounts
	// The repository also has a check, but it's good to have it here too.
	userToDelete, err := h.UserRepository.GetUserByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user for deletion", "details": err.Error()})
		return
	}

	if userToDelete.Role == models.UserRoleSuperadmin && requestingRole.(models.UserRole) != models.UserRoleSuperadmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only superadmin can delete superadmin accounts"})
		return
	}

	if err := h.UserRepository.DeleteUser(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
