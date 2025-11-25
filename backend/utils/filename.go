package utils

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// SlugifyFilename converts a title to a safe, URL-friendly filename
// It handles special characters, limits length, and adds timestamp for uniqueness
//
// Parameters:
//   - title: The original title/name to convert
//   - extension: File extension (e.g., ".jpg", ".png")
//
// Returns: A slugified filename with timestamp (e.g., "judul-berita-20241121-143022.jpg")
func SlugifyFilename(title string, extension string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)

	// Replace spaces and special chars with hyphens
	// Keep only alphanumeric characters and hyphens
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")

	// Remove leading/trailing hyphens
	slug = strings.Trim(slug, "-")

	// Limit length to 50 chars to avoid filesystem issues
	if len(slug) > 50 {
		slug = slug[:50]
		// Remove trailing hyphen if truncation created one
		slug = strings.TrimRight(slug, "-")
	}

	// Handle empty slug (all special characters)
	if slug == "" {
		slug = "file"
	}

	// Add timestamp for uniqueness (format: YYYYMMDD-HHMMSS)
	timestamp := time.Now().Format("20060102-150405")

	return fmt.Sprintf("%s-%s%s", slug, timestamp, extension)
}

// GenerateNewsFilename creates a filename for news article images
// Based on the article title
//
// Example: "Berita Terbaru!" -> "berita-terbaru-20241121-143022.jpg"
func GenerateNewsFilename(title string, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	if ext == "" {
		ext = ".jpg" // Default extension
	}
	return SlugifyFilename(title, ext)
}

// GenerateOfficialFilename creates a filename for official/aparatur photos
// Based on the official's name and position
//
// Example: "John Doe", "Kepala Desa" -> "john-doe-kepala-desa-20241121-143022.jpg"
func GenerateOfficialFilename(name string, position string, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	if ext == "" {
		ext = ".jpg" // Default extension
	}
	combined := fmt.Sprintf("%s %s", name, position)
	return SlugifyFilename(combined, ext)
}

// GenerateLogoFilename creates a standard filename for site logo
// Always returns "logo.png" or "logo.svg" regardless of original filename
//
// This ensures the logo always has a predictable filename
func GenerateLogoFilename(originalFilename string) string {
	ext := strings.ToLower(filepath.Ext(originalFilename))
	if ext == "" {
		ext = ".png" // Default to PNG
	}
	return fmt.Sprintf("logo%s", ext)
}

// GenerateHeroSliderFilename creates a filename for hero slider images
// Based on the slider title
//
// Example: "Selamat Datang" -> "selamat-datang-20241121-143022.jpg"
func GenerateHeroSliderFilename(title string, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	if ext == "" {
		ext = ".jpg" // Default extension
	}
	return SlugifyFilename(title, ext)
}

// GenerateStrukturFilename creates a filename for organizational structure image
// Always returns "struktur-organisasi.png" or similar
func GenerateStrukturFilename(originalFilename string) string {
	ext := strings.ToLower(filepath.Ext(originalFilename))
	if ext == "" {
		ext = ".png" // Default to PNG
	}
	timestamp := time.Now().Format("20060102-150405")
	return fmt.Sprintf("struktur-organisasi-%s%s", timestamp, ext)
}
