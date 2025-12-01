package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/config"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
)

// VillageOfficialHandler handles village official-related requests
type VillageOfficialHandler struct {
	Repo repositories.VillageOfficialRepository
}

// CreateVillageOfficialInput defines the input for creating a village official
type CreateVillageOfficialInput struct {
	Name         string  `json:"name" binding:"required"`
	Position     string  `json:"position" binding:"required"`
	PhotoURL     string  `json:"photo_url"`
	Bio          string  `json:"bio"`
	DisplayOrder int     `json:"display_order"`
	HamletNumber *int    `json:"hamlet_number"`
	HamletName   *string `json:"hamlet_name"`
}

// UpdateVillageOfficialInput defines the input for updating a village official
type UpdateVillageOfficialInput struct {
	Name         string  `json:"name"`
	Position     string  `json:"position"`
	PhotoURL     string  `json:"photo_url"`
	Bio          string  `json:"bio"`
	DisplayOrder int     `json:"display_order"`
	HamletNumber *int    `json:"hamlet_number"`
	HamletName   *string `json:"hamlet_name"`
}

// NewVillageOfficialHandler creates a new VillageOfficialHandler
func NewVillageOfficialHandler(repo repositories.VillageOfficialRepository) *VillageOfficialHandler {
	return &VillageOfficialHandler{Repo: repo}
}

// EnsureVillageOfficialsExist checks if at least one official exists and creates defaults if needed
func (h *VillageOfficialHandler) EnsureVillageOfficialsExist() error {
	// Check if any officials exist
	officials, err := h.Repo.GetAllVillageOfficials()
	if err != nil {
		log.Printf("Error fetching village officials: %v", err)
		return err
	}

	// If no officials, create defaults
	if len(officials) == 0 {
		log.Println("No village officials found, creating default officials")
		defaultOfficials := config.GetDefaultOfficials()
		
		for _, official := range defaultOfficials {
			if err := h.Repo.CreateVillageOfficial(&official); err != nil {
				log.Printf("Error creating default official: %v", err)
				return err
			}
		}
		log.Printf("Successfully created %d default village officials", len(defaultOfficials))
	} else {
		log.Printf("Found %d village official(s), no initialization needed", len(officials))
	}

	return nil
}

// CreateVillageOfficial creates a new village official
func (h *VillageOfficialHandler) CreateVillageOfficial(c *gin.Context) {
	var input CreateVillageOfficialInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Validate hamlet_number if provided
	if input.HamletNumber != nil {
		if *input.HamletNumber < 1 || *input.HamletNumber > 20 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "hamlet_number must be between 1 and 20"})
			return
		}
	}

	official := models.VillageOfficial{
		Name:         input.Name,
		Position:     input.Position,
		PhotoURL:     &input.PhotoURL,
		Bio:          &input.Bio,
		DisplayOrder: input.DisplayOrder,
		HamletNumber: input.HamletNumber,
		HamletName:   input.HamletName,
	}

	if err := h.Repo.CreateVillageOfficial(&official); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to create village official", err)
		return
	}

	c.JSON(http.StatusCreated, official)
}

// GetVillageOfficialByID retrieves a village official by ID
func (h *VillageOfficialHandler) GetVillageOfficialByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid official ID", err)
		return
	}

	official, err := h.Repo.GetVillageOfficialByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "Village official not found", err)
		return
	}

	c.JSON(http.StatusOK, official)
}

// GetAllVillageOfficials retrieves all village officials
func (h *VillageOfficialHandler) GetAllVillageOfficials(c *gin.Context) {
	// Auto-initialize if needed
	if err := h.EnsureVillageOfficialsExist(); err != nil {
		log.Printf("Failed to initialize village officials: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize village officials"})
		return
	}

	officials, err := h.Repo.GetAllVillageOfficials()
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve village officials", err)
		return
	}

	c.JSON(http.StatusOK, officials)
}

// UpdateVillageOfficial updates an existing village official
func (h *VillageOfficialHandler) UpdateVillageOfficial(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid official ID", err)
		return
	}

	var input UpdateVillageOfficialInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Validate hamlet_number if provided
	if input.HamletNumber != nil {
		if *input.HamletNumber < 1 || *input.HamletNumber > 20 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "hamlet_number must be between 1 and 20"})
			return
		}
	}

	existingOfficial, err := h.Repo.GetVillageOfficialByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "Village official not found", err)
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
	// Update hamlet_number and hamlet_name (can be set to null by sending null in JSON)
	existingOfficial.HamletNumber = input.HamletNumber
	existingOfficial.HamletName = input.HamletName

	if err := h.Repo.UpdateVillageOfficial(existingOfficial); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to update village official", err)
		return
	}

	c.JSON(http.StatusOK, existingOfficial)
}

// DeleteVillageOfficial deletes a village official by ID
func (h *VillageOfficialHandler) DeleteVillageOfficial(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid official ID", err)
		return
	}

	if err := h.Repo.DeleteVillageOfficial(id); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to delete village official", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Village official deleted successfully"})
}