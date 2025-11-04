package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

// ContactHandler handles contact form submissions
type ContactHandler struct {
	Repo repositories.ContactRepository
}

// NewContactHandler creates a new ContactHandler
func NewContactHandler(repo repositories.ContactRepository) *ContactHandler {
	return &ContactHandler{Repo: repo}
}

// CreateContact handles the creation of a new contact message
func (h *ContactHandler) CreateContact(c *gin.Context) {
	var input models.Contact

	// Bind JSON to the input struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Basic validation
	if input.Name == "" || input.Email == "" || input.Subject == "" || input.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	// Create the contact message
	if err := h.Repo.CreateContact(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Message sent successfully!"})
}

// GetAllContacts retrieves all contact messages
func (h *ContactHandler) GetAllContacts(c *gin.Context) {
	contacts, err := h.Repo.GetAllContacts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve contacts"})
		return
	}
	c.JSON(http.StatusOK, contacts)
}
