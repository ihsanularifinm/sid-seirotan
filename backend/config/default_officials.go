package config

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
)

// GetDefaultOfficials returns default village officials (Kepala Desa and Sekretaris Desa)
func GetDefaultOfficials() []models.VillageOfficial {
	photoURL1 := "https://placehold.co/400x400/64748b/ffffff?text=Kepala+Desa"
	bio1 := "Kepala Desa bertanggung jawab atas penyelenggaraan pemerintahan desa, pembangunan desa, pembinaan kemasyarakatan, dan pemberdayaan masyarakat desa."
	
	photoURL2 := "https://placehold.co/400x400/64748b/ffffff?text=Sekretaris+Desa"
	bio2 := "Sekretaris Desa membantu Kepala Desa dalam melaksanakan tugas dan wewenangnya, serta mengelola administrasi pemerintahan desa."
	
	return []models.VillageOfficial{
		{
			Name:         "Nama Kepala Desa",
			Position:     "Kepala Desa",
			PhotoURL:     &photoURL1,
			Bio:          &bio1,
			DisplayOrder: 1,
		},
		{
			Name:         "Nama Sekretaris Desa",
			Position:     "Sekretaris Desa",
			PhotoURL:     &photoURL2,
			Bio:          &bio2,
			DisplayOrder: 2,
		},
	}
}
