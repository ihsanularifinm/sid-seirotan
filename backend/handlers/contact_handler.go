package handlers

import (
	"net/http"

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
