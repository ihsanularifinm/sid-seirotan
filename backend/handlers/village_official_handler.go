package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

// VillageOfficialHandler handles village official-related requests
type VillageOfficialHandler struct {
	Repo repositories.VillageOfficialRepository
}

// CreateVillageOfficialInput defines the input for creating a village official
type CreateVillageOfficialInput struct {
	Name        string `json:"name" binding:"required"`
	Position    string `json:"position" binding:"required"`
	PhotoURL    string `json:"photo_url"`
	Bio         string `json:"bio"`
	DisplayOrder int    `json:"display_order"`
}

// UpdateVillageOfficialInput defines the input for updating a village official
type UpdateVillageOfficialInput struct {
	Name        string `json:"name"`
	Position    string `json:"position"`
	PhotoURL    string `json:"photo_url"`
	Bio         string `json:"bio"`
	DisplayOrder int    `json:"display_order"`
}

// NewVillageOfficialHandler creates a new VillageOfficialHandler
func NewVillageOfficialHandler(repo repositories.VillageOfficialRepository) *VillageOfficialHandler {
	return &VillageOfficialHandler{Repo: repo}
}

// CreateVillageOfficial creates a new village official
func (h *VillageOfficialHandler) CreateVillageOfficial(c *gin.Context) {
	var input CreateVillageOfficialInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	official := models.VillageOfficial{
		Name:        input.Name,
		Position:    input.Position,
		PhotoURL:    &input.PhotoURL,
		Bio:         &input.Bio,
		DisplayOrder: input.DisplayOrder,
	}

	if err := h.Repo.CreateVillageOfficial(&official); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create village official"})
		return
	}

	c.JSON(http.StatusCreated, official)
}

// GetVillageOfficialByID retrieves a village official by ID
func (h *VillageOfficialHandler) GetVillageOfficialByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid official ID"})
		return
	}

	official, err := h.Repo.GetVillageOfficialByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Village official not found"})
		return
	}

	c.JSON(http.StatusOK, official)
}

// GetAllVillageOfficials retrieves all village officials
func (h *VillageOfficialHandler) GetAllVillageOfficials(c *gin.Context) {
	officials, err := h.Repo.GetAllVillageOfficials()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve village officials"})
		return
	}

	c.JSON(http.StatusOK, officials)
}

// UpdateVillageOfficial updates an existing village official
func (h *VillageOfficialHandler) UpdateVillageOfficial(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid official ID"})
		return
	}

	var input UpdateVillageOfficialInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existingOfficial, err := h.Repo.GetVillageOfficialByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Village official not found"})
		return
	}

	if input.Name != "" {
		existingOfficial.Name = input.Name
	}
	if input.Position != "" {
		existingOfficial.Position = input.Position
	}
	if input.PhotoURL != "" {
		existingOfficial.PhotoURL = &input.PhotoURL
	}
	if input.Bio != "" {
		existingOfficial.Bio = &input.Bio
	}
	if input.DisplayOrder != 0 {
		existingOfficial.DisplayOrder = input.DisplayOrder
	}

	if err := h.Repo.UpdateVillageOfficial(existingOfficial); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update village official"})
		return
	}

	c.JSON(http.StatusOK, existingOfficial)
}

// DeleteVillageOfficial deletes a village official by ID
func (h *VillageOfficialHandler) DeleteVillageOfficial(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid official ID"})
		return
	}

	if err := h.Repo.DeleteVillageOfficial(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete village official"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Village official deleted successfully"})
}