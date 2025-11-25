package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
)

// UploadFile handles file uploads (legacy endpoint with UUID naming)
// Kept for backward compatibility
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	// Generate a new UUID for the filename
	filename := uuid.New().String() + filepath.Ext(file.Filename)
	filepath := fmt.Sprintf("uploads/%s", filename)

	// Save the file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save the file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": fmt.Sprintf("/uploads/%s", filename)})
}

// UploadWithNaming handles file uploads with intelligent naming based on upload type
// Supports: news, official, logo, hero_slider, struktur
func UploadWithNaming(c *gin.Context) {
	// Get form data
	uploadType := c.PostForm("upload_type")
	title := c.PostForm("title")
	name := c.PostForm("name")
	position := c.PostForm("position")

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	// Validate upload_type
	validTypes := []string{"news", "official", "logo", "hero_slider", "struktur"}
	isValidType := false
	for _, validType := range validTypes {
		if uploadType == validType {
			isValidType = true
			break
		}
	}
	if !isValidType {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid upload_type. Must be one of: %s", strings.Join(validTypes, ", ")),
		})
		return
	}

	// Generate appropriate filename based on upload type
	var filename string
	switch uploadType {
	case "news":
		if title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required for news upload"})
			return
		}
		filename = utils.GenerateNewsFilename(title, file.Filename)

	case "official":
		if name == "" || position == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Name and position are required for official upload"})
			return
		}
		filename = utils.GenerateOfficialFilename(name, position, file.Filename)

	case "logo":
		// Validate PNG or SVG only for logo
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".png" && ext != ".svg" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Logo must be PNG or SVG format"})
			return
		}
		filename = utils.GenerateLogoFilename(file.Filename)

		// Delete old logo file if exists (to avoid accumulation)
		oldLogoPattern := "uploads/logo.*"
		matches, _ := filepath.Glob(oldLogoPattern)
		for _, match := range matches {
			os.Remove(match)
		}

	case "hero_slider":
		if title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required for hero slider upload"})
			return
		}
		filename = utils.GenerateHeroSliderFilename(title, file.Filename)

	case "struktur":
		filename = utils.GenerateStrukturFilename(file.Filename)

		// Delete old struktur file if exists
		oldStrukturPattern := "uploads/struktur-organisasi-*"
		matches, _ := filepath.Glob(oldStrukturPattern)
		for _, match := range matches {
			os.Remove(match)
		}

	default:
		// Fallback to UUID (should not reach here due to validation above)
		filename = uuid.New().String() + filepath.Ext(file.Filename)
	}

	// Ensure uploads directory exists
	if err := os.MkdirAll("uploads", 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory"})
		return
	}

	// Save the file
	savePath := fmt.Sprintf("uploads/%s", filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save the file"})
		return
	}

	// Return both URL and filename
	c.JSON(http.StatusOK, gin.H{
		"url":      fmt.Sprintf("/uploads/%s", filename),
		"filename": filename,
	})
}