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
		DefaultValue: "[Nama Website Desa]",
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
		DefaultValue: "/assets/img/logo-placeholder.png",
		Group:        "general",
		Description:  "Path ke file logo",
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
		DefaultValue: "[Sejarah singkat desa dari masa ke masa]",
		Group:        "profile",
		Description:  "Sejarah lengkap desa",
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
