package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
)

// ContactHandler handles contact form submissions
type ContactHandler struct {
	Repo repositories.ContactRepository
}

// NewContactHandler creates a new ContactHandler
func NewContactHandler(repo repositories.ContactRepository) *ContactHandler {
	return &ContactHandler{Repo: repo}
}

// CreateContactInput defines the input for creating a contact message
type CreateContactInput struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required"`
}

// CreateContact handles the creation of a new contact message
func (h *ContactHandler) CreateContact(c *gin.Context) {
	var input CreateContactInput

	// Bind JSON to the input struct
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Additional validation
	if len(input.Name) > 255 {
		utils.RespondError(c, http.StatusBadRequest, "Name must be 255 characters or less", nil)
		return
	}
	if len(input.Email) > 255 {
		utils.RespondError(c, http.StatusBadRequest, "Email must be 255 characters or less", nil)
		return
	}
	if len(input.Subject) > 500 {
		utils.RespondError(c, http.StatusBadRequest, "Subject must be 500 characters or less", nil)
		return
	}
	if len(input.Message) > 5000 {
		utils.RespondError(c, http.StatusBadRequest, "Message must be 5000 characters or less", nil)
		return
	}

	// Sanitize inputs (trim whitespace)
	input.Name = trimString(input.Name)
	input.Email = trimString(input.Email)
	input.Subject = trimString(input.Subject)
	input.Message = trimString(input.Message)

	// Validate after trimming
	if input.Name == "" || input.Email == "" || input.Subject == "" || input.Message == "" {
		utils.RespondError(c, http.StatusBadRequest, "All fields are required and cannot be empty", nil)
		return
	}

	contact := models.Contact{
		Name:    input.Name,
		Email:   input.Email,
		Subject: input.Subject,
		Message: input.Message,
	}

	// Create the contact message
	if err := h.Repo.CreateContact(&contact); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to save message", err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Message sent successfully!"})
}

// GetAllContacts retrieves all contact messages
func (h *ContactHandler) GetAllContacts(c *gin.Context) {
	contacts, err := h.Repo.GetAllContacts()
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve contacts", err)
		return
	}
	c.JSON(http.StatusOK, contacts)
}

// trimString trims whitespace from a string
func trimString(s string) string {
	return strings.TrimSpace(s)
}
