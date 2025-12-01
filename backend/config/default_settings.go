package config

// SettingSchema defines the structure for default settings
type SettingSchema struct {
	Key          string
	DefaultValue string
	Group        string
	Description  string
}

// DefaultSettings contains all default settings for the application
var DefaultSettings = []SettingSchema{
	// General Settings (7 items)
	{
		Key:          "site_name",
		DefaultValue: "[Nama Desa]",
		Group:        "general",
		Description:  "Nama website yang ditampilkan di header dan title",
	},
	{
		Key:          "site_description",
		DefaultValue: "[Deskripsi singkat tentang website desa]",
		Group:        "general",
		Description:  "Deskripsi untuk SEO meta tag",
	},
	{
		Key:          "site_logo",
		DefaultValue: "https://placehold.co/400x400/2563eb/ffffff?text=Logo+%7C+400x400px&font=montserrat",
		Group:        "general",
		Description:  "Logo website (PNG atau SVG, ukuran rekomendasi: 400x400px)",
	},
	{
		Key:          "contact_email",
		DefaultValue: "[email@desa.go.id]",
		Group:        "general",
		Description:  "Email kontak desa",
	},
	{
		Key:          "contact_phone",
		DefaultValue: "[0xxx-xxxxxxx]",
		Group:        "general",
		Description:  "Nomor telepon kantor desa",
	},
	{
		Key:          "contact_whatsapp",
		DefaultValue: "[62xxx]",
		Group:        "general",
		Description:  "Nomor WhatsApp untuk kontak",
	},
	{
		Key:          "contact_address",
		DefaultValue: "[Alamat lengkap kantor desa]",
		Group:        "general",
		Description:  "Alamat lengkap kantor desa",
	},
	{
		Key:          "map_embed_url",
		DefaultValue: "",
		Group:        "general",
		Description:  "URL embed Google Maps (paste src dari iframe Google Maps)",
	},
	{
		Key:          "google_maps_link",
		DefaultValue: "https://maps.google.com",
		Group:        "general",
		Description:  "Link Google Maps untuk tombol petunjuk arah",
	},
	{
		Key:          "district",
		DefaultValue: "",
		Group:        "general",
		Description:  "Kecamatan untuk ditampilkan di header",
	},
	{
		Key:          "regency",
		DefaultValue: "",
		Group:        "general",
		Description:  "Kabupaten untuk ditampilkan di header",
	},

	// Profile Settings (11 items)
	{
		Key:          "village_name",
		DefaultValue: "[Nama Desa]",
		Group:        "profile",
		Description:  "Nama resmi desa",
	},
	{
		Key:          "village_head",
		DefaultValue: "[Nama Kepala Desa]",
		Group:        "profile",
		Description:  "Nama kepala desa yang menjabat",
	},
	{
		Key:          "village_vision",
		DefaultValue: "[Visi desa untuk masa depan]",
		Group:        "profile",
		Description:  "Visi desa",
	},
	{
		Key:          "village_mission",
		DefaultValue: "[Misi 1]\n[Misi 2]\n[Misi 3]",
		Group:        "profile",
		Description:  "Misi desa (pisahkan dengan newline)",
	},
	{
		Key:          "village_history",
		DefaultValue: "[Sejarah desa dari masa ke masa]",
		Group:        "profile",
		Description:  "Sejarah desa",
	},
	{
		Key:          "village_area",
		DefaultValue: "[xxx hektar]",
		Group:        "profile",
		Description:  "Luas wilayah desa",
	},
	{
		Key:          "village_population",
		DefaultValue: "[xxx jiwa]",
		Group:        "profile",
		Description:  "Jumlah penduduk",
	},
	{
		Key:          "village_address",
		DefaultValue: "[Alamat desa]",
		Group:        "profile",
		Description:  "Alamat desa",
	},
	{
		Key:          "village_district",
		DefaultValue: "[Nama Kecamatan]",
		Group:        "profile",
		Description:  "Kecamatan",
	},
	{
		Key:          "village_regency",
		DefaultValue: "[Nama Kabupaten]",
		Group:        "profile",
		Description:  "Kabupaten",
	},
	{
		Key:          "village_province",
		DefaultValue: "[Nama Provinsi]",
		Group:        "profile",
		Description:  "Provinsi",
	},
	{
		Key:          "village_postal_code",
		DefaultValue: "[xxxxx]",
		Group:        "profile",
		Description:  "Kode pos",
	},

	// Government Settings (1 item)
	{
		Key:          "organizational_structure_image",
		DefaultValue: "https://placehold.co/1200x800/e5e7eb/6b7280?text=Struktur+Organisasi+%7C+1200x800px&font=montserrat",
		Group:        "government",
		Description:  "Gambar struktur organisasi pemerintahan desa (ukuran rekomendasi: 1200x800px)",
	},

	// Social Media Settings (5 items)
	{
		Key:          "facebook_url",
		DefaultValue: "",
		Group:        "social",
		Description:  "URL Facebook page (opsional)",
	},
	{
		Key:          "instagram_url",
		DefaultValue: "",
		Group:        "social",
		Description:  "URL Instagram profile (opsional)",
	},
	{
		Key:          "twitter_url",
		DefaultValue: "",
		Group:        "social",
		Description:  "URL Twitter profile (opsional)",
	},
	{
		Key:          "youtube_url",
		DefaultValue: "",
		Group:        "social",
		Description:  "URL YouTube channel (opsional)",
	},
	{
		Key:          "tiktok_url",
		DefaultValue: "",
		Group:        "social",
		Description:  "URL TikTok profile (opsional)",
	},
}

// GetDefaultSettingsByGroup returns default settings filtered by group
func GetDefaultSettingsByGroup(group string) []SettingSchema {
	var result []SettingSchema
	for _, setting := range DefaultSettings {
		if setting.Group == group {
			result = append(result, setting)
		}
	}
	return result
}

// GetAllDefaultSettings returns all default settings
func GetAllDefaultSettings() []SettingSchema {
	return DefaultSettings
}
