package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/config"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

type HeroSliderHandler struct {
	repo repositories.HeroSliderRepository
}

func NewHeroSliderHandler(repo repositories.HeroSliderRepository) *HeroSliderHandler {
	return &HeroSliderHandler{repo: repo}
}

// EnsureHeroSliderExists checks if at least one active slider exists and creates default if needed
func (h *HeroSliderHandler) EnsureHeroSliderExists() error {
	// Check if any active sliders exist
	sliders, err := h.repo.GetActive()
	if err != nil {
		log.Printf("Error fetching active sliders: %v", err)
		return err
	}

	// If no active sliders, create default
	if len(sliders) == 0 {
		log.Println("No active hero sliders found, creating default slider")
		defaultSlider := config.GetDefaultHeroSlider()
		if err := h.repo.Create(&defaultSlider); err != nil {
			log.Printf("Error creating default hero slider: %v", err)
			return err
		}
		log.Println("Successfully created default hero slider")
	} else {
		log.Printf("Found %d active hero slider(s), no initialization needed", len(sliders))
	}

	return nil
}

// GetActive - Public endpoint to get active sliders
func (h *HeroSliderHandler) GetActive(c *gin.Context) {
	// Auto-initialize if needed
	if err := h.EnsureHeroSliderExists(); err != nil {
		log.Printf("Failed to initialize hero sliders: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize hero sliders"})
		return
	}

	sliders, err := h.repo.GetActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch hero sliders"})
		return
	}
	c.JSON(http.StatusOK, sliders)
}

// GetAll - Admin endpoint to get all sliders
func (h *HeroSliderHandler) GetAll(c *gin.Context) {
	sliders, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch hero sliders"})
		return
	}
	c.JSON(http.StatusOK, sliders)
}

// GetByID - Admin endpoint to get slider by ID
func (h *HeroSliderHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	slider, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hero slider not found"})
		return
	}

	c.JSON(http.StatusOK, slider)
}

// Create - Admin endpoint to create new slider
func (h *HeroSliderHandler) Create(c *gin.Context) {
	var slider models.HeroSlider
	if err := c.ShouldBindJSON(&slider); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate media type
	if slider.MediaType != models.MediaTypeImage && slider.MediaType != models.MediaTypeVideo {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media type. Must be 'image' or 'video'"})
		return
	}

	if err := h.repo.Create(&slider); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create hero slider"})
		return
	}

	c.JSON(http.StatusCreated, slider)
}

// Update - Admin endpoint to update slider
func (h *HeroSliderHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Check if slider exists
	existing, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hero slider not found"})
		return
	}

	var updateData models.HeroSlider
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate media type
	if updateData.MediaType != models.MediaTypeImage && updateData.MediaType != models.MediaTypeVideo {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media type. Must be 'image' or 'video'"})
		return
	}

	// Update fields
	existing.Title = updateData.Title
	existing.Subtitle = updateData.Subtitle
	existing.MediaURL = updateData.MediaURL
	existing.MediaType = updateData.MediaType
	existing.LinkURL = updateData.LinkURL
	existing.LinkText = updateData.LinkText
	existing.DisplayOrder = updateData.DisplayOrder
	existing.IsActive = updateData.IsActive

	if err := h.repo.Update(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hero slider"})
		return
	}

	c.JSON(http.StatusOK, existing)
}

// Delete - Admin endpoint to delete slider
func (h *HeroSliderHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Check if slider exists
	_, err = h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hero slider not found"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete hero slider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Hero slider deleted successfully"})
}
