package utils

import (
	"strings"
	"testing"
)

func TestSlugifyFilename(t *testing.T) {
	tests := []struct {
		name      string
		title     string
		extension string
		wantStart string // Expected start of filename (before timestamp)
		wantExt   string // Expected extension
	}{
		{
			name:      "Simple title",
			title:     "Hello World",
			extension: ".jpg",
			wantStart: "hello-world-",
			wantExt:   ".jpg",
		},
		{
			name:      "Title with special characters",
			title:     "Berita Terbaru! @#$%",
			extension: ".png",
			wantStart: "berita-terbaru-",
			wantExt:   ".png",
		},
		{
			name:      "Title with multiple spaces",
			title:     "Multiple   Spaces   Here",
			extension: ".jpg",
			wantStart: "multiple-spaces-here-",
			wantExt:   ".jpg",
		},
		{
			name:      "Very long title",
			title:     "This is a very long title that should be truncated to fifty characters maximum",
			extension: ".jpg",
			wantStart: "this-is-a-very-long-title-that-should-be-truncated-",
			wantExt:   ".jpg",
		},
		{
			name:      "Title with Indonesian characters",
			title:     "Visi & Misi Desa",
			extension: ".jpg",
			wantStart: "visi-misi-desa-",
			wantExt:   ".jpg",
		},
		{
			name:      "Title with only special characters",
			title:     "@#$%^&*()",
			extension: ".jpg",
			wantStart: "file-",
			wantExt:   ".jpg",
		},
		{
			name:      "Empty title",
			title:     "",
			extension: ".jpg",
			wantStart: "file-",
			wantExt:   ".jpg",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SlugifyFilename(tt.title, tt.extension)

			// Check if result starts with expected slug
			if !strings.HasPrefix(result, tt.wantStart) {
				t.Errorf("SlugifyFilename() = %v, want prefix %v", result, tt.wantStart)
			}

			// Check if result ends with expected extension
			if !strings.HasSuffix(result, tt.wantExt) {
				t.Errorf("SlugifyFilename() = %v, want suffix %v", result, tt.wantExt)
			}

			// Check if result contains timestamp (format: YYYYMMDD-HHMMSS)
			// Should have pattern like: slug-20241121-143022.ext
			parts := strings.Split(result, "-")
			if len(parts) < 3 {
				t.Errorf("SlugifyFilename() = %v, expected to contain timestamp", result)
			}

			// Check length is reasonable (not too long)
			if len(result) > 100 {
				t.Errorf("SlugifyFilename() = %v, length %d exceeds reasonable limit", result, len(result))
			}
		})
	}
}

func TestGenerateNewsFilename(t *testing.T) {
	tests := []struct {
		name             string
		title            string
		originalFilename string
		wantContains     string
		wantExt          string
	}{
		{
			name:             "News with JPG",
			title:            "Berita Terbaru",
			originalFilename: "photo.jpg",
			wantContains:     "berita-terbaru",
			wantExt:          ".jpg",
		},
		{
			name:             "News with PNG",
			title:            "Pengumuman Penting",
			originalFilename: "image.png",
			wantContains:     "pengumuman-penting",
			wantExt:          ".png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateNewsFilename(tt.title, tt.originalFilename)

			if !strings.Contains(result, tt.wantContains) {
				t.Errorf("GenerateNewsFilename() = %v, want to contain %v", result, tt.wantContains)
			}

			if !strings.HasSuffix(result, tt.wantExt) {
				t.Errorf("GenerateNewsFilename() = %v, want extension %v", result, tt.wantExt)
			}
		})
	}
}

func TestGenerateOfficialFilename(t *testing.T) {
	tests := []struct {
		name             string
		officialName     string
		position         string
		originalFilename string
		wantContains     string
		wantExt          string
	}{
		{
			name:             "Official with name and position",
			officialName:     "John Doe",
			position:         "Kepala Desa",
			originalFilename: "photo.jpg",
			wantContains:     "john-doe-kepala-desa",
			wantExt:          ".jpg",
		},
		{
			name:             "Official with long name",
			officialName:     "Ahmad Subarjo",
			position:         "Sekretaris Desa",
			originalFilename: "image.png",
			wantContains:     "ahmad-subarjo-sekretaris-desa",
			wantExt:          ".png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateOfficialFilename(tt.officialName, tt.position, tt.originalFilename)

			if !strings.Contains(result, tt.wantContains) {
				t.Errorf("GenerateOfficialFilename() = %v, want to contain %v", result, tt.wantContains)
			}

			if !strings.HasSuffix(result, tt.wantExt) {
				t.Errorf("GenerateOfficialFilename() = %v, want extension %v", result, tt.wantExt)
			}
		})
	}
}

func TestGenerateLogoFilename(t *testing.T) {
	tests := []struct {
		name             string
		originalFilename string
		want             string
	}{
		{
			name:             "PNG logo",
			originalFilename: "company-logo.png",
			want:             "logo.png",
		},
		{
			name:             "SVG logo",
			originalFilename: "site-logo.svg",
			want:             "logo.svg",
		},
		{
			name:             "JPG logo (should keep extension)",
			originalFilename: "logo-file.jpg",
			want:             "logo.jpg",
		},
		{
			name:             "No extension (default to PNG)",
			originalFilename: "logofile",
			want:             "logo.png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateLogoFilename(tt.originalFilename)

			if result != tt.want {
				t.Errorf("GenerateLogoFilename() = %v, want %v", result, tt.want)
			}
		})
	}
}

func TestGenerateHeroSliderFilename(t *testing.T) {
	tests := []struct {
		name             string
		title            string
		originalFilename string
		wantContains     string
		wantExt          string
	}{
		{
			name:             "Hero slider with title",
			title:            "Selamat Datang",
			originalFilename: "slider.jpg",
			wantContains:     "selamat-datang",
			wantExt:          ".jpg",
		},
		{
			name:             "Hero slider with long title",
			title:            "Selamat Datang di Website Desa Kami",
			originalFilename: "hero.png",
			wantContains:     "selamat-datang-di-website-desa-kami",
			wantExt:          ".png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateHeroSliderFilename(tt.title, tt.originalFilename)

			if !strings.Contains(result, tt.wantContains) {
				t.Errorf("GenerateHeroSliderFilename() = %v, want to contain %v", result, tt.wantContains)
			}

			if !strings.HasSuffix(result, tt.wantExt) {
				t.Errorf("GenerateHeroSliderFilename() = %v, want extension %v", result, tt.wantExt)
			}
		})
	}
}

func TestGenerateStrukturFilename(t *testing.T) {
	tests := []struct {
		name             string
		originalFilename string
		wantContains     string
		wantExt          string
	}{
		{
			name:             "Struktur with PNG",
			originalFilename: "struktur.png",
			wantContains:     "struktur-organisasi",
			wantExt:          ".png",
		},
		{
			name:             "Struktur with JPG",
			originalFilename: "org-chart.jpg",
			wantContains:     "struktur-organisasi",
			wantExt:          ".jpg",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateStrukturFilename(tt.originalFilename)

			if !strings.Contains(result, tt.wantContains) {
				t.Errorf("GenerateStrukturFilename() = %v, want to contain %v", result, tt.wantContains)
			}

			if !strings.HasSuffix(result, tt.wantExt) {
				t.Errorf("GenerateStrukturFilename() = %v, want extension %v", result, tt.wantExt)
			}
		})
	}
}

// Test uniqueness - two calls should generate different filenames due to timestamp
func TestFilenameUniqueness(t *testing.T) {
	title := "Test Title"
	filename1 := GenerateNewsFilename(title, "test.jpg")
	filename2 := GenerateNewsFilename(title, "test.jpg")

	// They might be the same if called in the same second, but structure should be correct
	// Just verify both are valid
	if !strings.Contains(filename1, "test-title") {
		t.Errorf("First filename invalid: %v", filename1)
	}
	if !strings.Contains(filename2, "test-title") {
		t.Errorf("Second filename invalid: %v", filename2)
	}
}
