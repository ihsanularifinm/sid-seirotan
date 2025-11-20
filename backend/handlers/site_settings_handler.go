package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

type SiteSettingsHandler struct {
	repo repositories.SiteSettingsRepository
}

func NewSiteSettingsHandler(repo repositories.SiteSettingsRepository) *SiteSettingsHandler {
	return &SiteSettingsHandler{repo: repo}
}

// GetAll - Public endpoint to get all settings
func (h *SiteSettingsHandler) GetAll(c *gin.Context) {
	settings, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	// Convert to map for easier frontend consumption
	settingsMap := make(map[string]interface{})
	for _, setting := range settings {
		if setting.SettingValue != nil {
			settingsMap[setting.SettingKey] = *setting.SettingValue
		} else {
			settingsMap[setting.SettingKey] = ""
		}
	}

	c.JSON(http.StatusOK, settingsMap)
}

// GetByGroup - Public endpoint to get settings by group
func (h *SiteSettingsHandler) GetByGroup(c *gin.Context) {
	group := c.Param("group")
	if group == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group parameter is required"})
		return
	}

	settings, err := h.repo.GetByGroup(group)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	// Convert to map for easier frontend consumption
	settingsMap := make(map[string]interface{})
	for _, setting := range settings {
		if setting.SettingValue != nil {
			settingsMap[setting.SettingKey] = *setting.SettingValue
		} else {
			settingsMap[setting.SettingKey] = ""
		}
	}

	c.JSON(http.StatusOK, settingsMap)
}

// GetAllAdmin - Admin endpoint to get all settings with full details
func (h *SiteSettingsHandler) GetAllAdmin(c *gin.Context) {
	settings, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	// Group settings by setting_group
	grouped := make(map[string][]models.SiteSetting)
	for _, setting := range settings {
		grouped[setting.SettingGroup] = append(grouped[setting.SettingGroup], setting)
	}

	c.JSON(http.StatusOK, grouped)
}

// BulkUpdate - Admin endpoint to update multiple settings
func (h *SiteSettingsHandler) BulkUpdate(c *gin.Context) {
	var settings []models.SiteSetting
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(settings) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No settings provided"})
		return
	}

	if err := h.repo.BulkUpsert(settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully", "count": len(settings)})
}

// Upsert - Admin endpoint to create or update a single setting
func (h *SiteSettingsHandler) Upsert(c *gin.Context) {
	var setting models.SiteSetting
	if err := c.ShouldBindJSON(&setting); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if setting.SettingKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "setting_key is required"})
		return
	}

	if err := h.repo.Upsert(&setting); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save setting"})
		return
	}

	c.JSON(http.StatusOK, setting)
}
