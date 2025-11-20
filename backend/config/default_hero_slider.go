package config

import "github.com/ihsanularifinm/sid-seirotan/backend/models"

// GetDefaultHeroSlider returns a default hero slider with placeholder content
func GetDefaultHeroSlider() models.HeroSlider {
	title := "Selamat Datang di Website Desa"
	subtitle := "Silakan edit slider ini melalui menu Admin > Hero Slider. Ukuran gambar yang direkomendasikan: 1920x1080 pixels (16:9)"
	
	// Use CDN placeholder image with size recommendation displayed
	mediaURL := "https://placehold.co/1920x1080/2563eb/ffffff?text=Hero+Slider+Placeholder+%7C+Recommended:+1920x1080px&font=montserrat"
	
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
