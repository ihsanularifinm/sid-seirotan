package config

import "github.com/ihsanularifinm/sid-seirotan/backend/models"

// GetDefaultHeroSlider returns a default hero slider with placeholder content
func GetDefaultHeroSlider() models.HeroSlider {
	title := "Selamat Datang di Website Desa"
	subtitle := "Silakan edit slider ini melalui menu Admin > Hero Slider"
	
	// Use CDN placeholder image (placehold.co - free, no signup required)
	// Fallback to local SVG if CDN is unavailable
	mediaURL := "https://placehold.co/1920x1080/2563eb/ffffff?text=Selamat+Datang"
	
	linkURL := "/profil"
	linkText := "Pelajari Lebih Lanjut"

	return models.HeroSlider{
		Title:        title,
		Subtitle:     &subtitle,
		MediaURL:     mediaURL,
		MediaType:    models.MediaTypeImage,
		LinkURL:      &linkURL,
		LinkText:     &linkText,
		DisplayOrder: 1,
		IsActive:     true,
	}
}
