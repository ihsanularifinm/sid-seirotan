# Feature Plan: Hero Slider & Dynamic Profile

## 🎯 Objectives

1. **Hero Slider di Homepage**
   - Admin bisa upload foto/video untuk hero section
   - Support multiple slides dengan auto-play
   - Bisa set title, subtitle, dan CTA button
   - Bisa diaktifkan/nonaktifkan per slide

2. **Dynamic Profile Desa**
   - Profile desa bisa diubah dari admin panel
   - Tidak hardcoded di frontend
   - Include: nama desa, kepala desa, visi, misi, sejarah, luas wilayah, jumlah penduduk

## 📊 Database Changes

### New Table: `hero_sliders`

```sql
CREATE TABLE hero_sliders (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    media_url VARCHAR(255) NOT NULL,
    media_type media_type NOT NULL DEFAULT 'image',
    link_url VARCHAR(255),
    link_text VARCHAR(100),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

**Fields:**
- `title` - Judul utama slider
- `subtitle` - Subjudul/deskripsi
- `media_url` - URL ke file image/video
- `media_type` - ENUM: 'image' atau 'video'
- `link_url` - Optional URL untuk CTA button
- `link_text` - Text untuk CTA button (e.g., "Selengkapnya")
- `display_order` - Urutan tampil (ASC)
- `is_active` - Aktif/nonaktif

### Extended: `site_settings`

Tambahkan settings untuk profile desa:

**Group: `profile`**
- `village_name` - Nama desa
- `village_head` - Nama kepala desa
- `village_vision` - Visi desa
- `village_mission` - Misi desa (bisa multi-line)
- `village_history` - Sejarah desa
- `village_area` - Luas wilayah (e.g., "25.5 km²")
- `village_population` - Jumlah penduduk (e.g., "5,432 jiwa")
- `village_address` - Alamat lengkap
- `village_postal_code` - Kode pos
- `village_district` - Kecamatan
- `village_regency` - Kabupaten
- `village_province` - Provinsi

**Group: `general`**
- `site_name` - Nama website
- `site_description` - Deskripsi website
- `site_logo` - URL logo
- `contact_email` - Email kontak
- `contact_phone` - Nomor telepon
- `contact_whatsapp` - Nomor WhatsApp

**Group: `social`**
- `facebook_url`
- `instagram_url`
- `twitter_url`
- `youtube_url`

## 🏗️ Backend Implementation

### 1. Models

**File: `backend/models/models.go`**

```go
// Add new enum
type MediaType string
const (
    MediaTypeImage MediaType = "image"
    MediaTypeVideo MediaType = "video"
)

// Add new model
type HeroSlider struct {
    ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
    Title        string         `gorm:"type:varchar(255);not null" json:"title"`
    Subtitle     *string        `gorm:"type:varchar(255)" json:"subtitle,omitempty"`
    MediaURL     string         `gorm:"type:varchar(255);not null" json:"media_url"`
    MediaType    MediaType      `gorm:"type:media_type;not null;default:'image'" json:"media_type"`
    LinkURL      *string        `gorm:"type:varchar(255)" json:"link_url,omitempty"`
    LinkText     *string        `gorm:"type:varchar(100)" json:"link_text,omitempty"`
    DisplayOrder int            `gorm:"not null;default:0" json:"display_order"`
    IsActive     bool           `gorm:"not null;default:true" json:"is_active"`
    CreatedAt    time.Time      `gorm:"not null;default:now()" json:"created_at"`
    UpdatedAt    time.Time      `gorm:"not null;default:now()" json:"updated_at"`
    DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
```

### 2. Repository

**File: `backend/repositories/hero_slider_repository.go`**

```go
type HeroSliderRepository interface {
    GetAll() ([]models.HeroSlider, error)
    GetActive() ([]models.HeroSlider, error)
    GetByID(id uint64) (*models.HeroSlider, error)
    Create(slider *models.HeroSlider) error
    Update(slider *models.HeroSlider) error
    Delete(id uint64) error
}
```

**File: `backend/repositories/site_settings_repository.go`**

```go
type SiteSettingsRepository interface {
    GetByKey(key string) (*models.SiteSetting, error)
    GetByGroup(group string) ([]models.SiteSetting, error)
    GetAll() ([]models.SiteSetting, error)
    Upsert(setting *models.SiteSetting) error
    BulkUpsert(settings []models.SiteSetting) error
}
```

### 3. Handlers

**File: `backend/handlers/hero_slider_handler.go`**

Endpoints:
- `GET /api/v1/hero-sliders` - Get all active sliders (public)
- `GET /api/v1/admin/hero-sliders` - Get all sliders (admin)
- `GET /api/v1/admin/hero-sliders/:id` - Get by ID (admin)
- `POST /api/v1/admin/hero-sliders` - Create (admin)
- `PUT /api/v1/admin/hero-sliders/:id` - Update (admin)
- `DELETE /api/v1/admin/hero-sliders/:id` - Delete (admin)

**File: `backend/handlers/site_settings_handler.go`**

Endpoints:
- `GET /api/v1/settings` - Get all public settings (public)
- `GET /api/v1/settings/:group` - Get by group (public)
- `GET /api/v1/admin/settings` - Get all settings (admin)
- `PUT /api/v1/admin/settings` - Bulk update (admin)

### 4. Routes

**File: `backend/routes/routes.go`**

```go
// Public routes
publicRoutes.GET("/hero-sliders", heroSliderHandler.GetActive)
publicRoutes.GET("/settings", settingsHandler.GetAll)
publicRoutes.GET("/settings/:group", settingsHandler.GetByGroup)

// Admin routes
adminRoutes.GET("/hero-sliders", heroSliderHandler.GetAll)
adminRoutes.GET("/hero-sliders/:id", heroSliderHandler.GetByID)
adminRoutes.POST("/hero-sliders", heroSliderHandler.Create)
adminRoutes.PUT("/hero-sliders/:id", heroSliderHandler.Update)
adminRoutes.DELETE("/hero-sliders/:id", heroSliderHandler.Delete)

adminRoutes.GET("/settings", settingsHandler.GetAllAdmin)
adminRoutes.PUT("/settings", settingsHandler.BulkUpdate)
```

## 🎨 Frontend Implementation

### 1. Types

**File: `frontend/src/types/hero-slider.ts`**

```typescript
export type MediaType = 'image' | 'video';

export interface HeroSlider {
  id: number;
  title: string;
  subtitle?: string;
  media_url: string;
  media_type: MediaType;
  link_url?: string;
  link_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**File: `frontend/src/types/settings.ts`**

```typescript
export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_group: string;
}

export interface VillageProfile {
  village_name: string;
  village_head: string;
  village_vision: string;
  village_mission: string;
  village_history: string;
  village_area: string;
  village_population: string;
  village_address: string;
  village_postal_code: string;
  village_district: string;
  village_regency: string;
  village_province: string;
}

export interface GeneralSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
}

export interface SocialSettings {
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
}
```

### 2. API Services

**File: `frontend/src/services/api.ts`**

```typescript
// Hero Sliders
export const getHeroSliders = async (): Promise<HeroSlider[]> => {
  const response = await api.get('/api/v1/hero-sliders');
  return response.data;
};

// Settings
export const getSettings = async (): Promise<SiteSetting[]> => {
  const response = await api.get('/api/v1/settings');
  return response.data;
};

export const getSettingsByGroup = async (group: string): Promise<SiteSetting[]> => {
  const response = await api.get(`/api/v1/settings/${group}`);
  return response.data;
};
```

### 3. Components

**File: `frontend/src/components/HeroSlider.tsx`**

Features:
- Auto-play carousel
- Support image & video
- Responsive design
- Navigation dots
- CTA button (optional)

**File: `frontend/src/components/VillageProfile.tsx`**

Features:
- Display dynamic profile data
- Fetch from API
- Loading skeleton
- Error handling

### 4. Admin Pages

**File: `frontend/src/app/admin/hero-sliders/page.tsx`**

Features:
- List all sliders
- Add new slider
- Edit slider
- Delete slider
- Toggle active/inactive
- Drag & drop reorder
- Upload image/video

**File: `frontend/src/app/admin/settings/page.tsx`**

Features:
- Tabs for different groups (General, Profile, Social)
- Form for each setting
- Bulk save
- Preview changes

## 📝 Implementation Steps

### Phase 1: Database & Backend (Priority)

1. ✅ Update `table_db.dbml`
2. [ ] Create migration file for `hero_sliders` table
3. [ ] Add `media_type` enum to migration
4. [ ] Update `backend/models/models.go`
5. [ ] Create `hero_slider_repository.go`
6. [ ] Create `site_settings_repository.go`
7. [ ] Create `hero_slider_handler.go`
8. [ ] Update `site_settings_handler.go`
9. [ ] Update routes
10. [ ] Test API endpoints

### Phase 2: Frontend Public (Priority)

11. [ ] Create types
12. [ ] Update API service
13. [ ] Create `HeroSlider` component
14. [ ] Update homepage to use `HeroSlider`
15. [ ] Create `VillageProfile` component
16. [ ] Update profile page to use dynamic data
17. [ ] Test responsive design

### Phase 3: Frontend Admin

18. [ ] Create admin hero slider list page
19. [ ] Create admin hero slider form
20. [ ] Create admin settings page
21. [ ] Add image/video upload
22. [ ] Add drag & drop reorder
23. [ ] Test CRUD operations

### Phase 4: Testing & Polish

24. [ ] Test all endpoints
25. [ ] Test file upload
26. [ ] Test video playback
27. [ ] Optimize images
28. [ ] Add loading states
29. [ ] Add error handling
30. [ ] Update documentation

## 🎬 Demo Data

### Hero Sliders

```json
[
  {
    "title": "Selamat Datang di Desa Sei Rotan",
    "subtitle": "Desa yang Maju, Sejahtera, dan Berbudaya",
    "media_url": "/uploads/hero-1.jpg",
    "media_type": "image",
    "link_url": "/profil",
    "link_text": "Selengkapnya",
    "display_order": 1,
    "is_active": true
  },
  {
    "title": "Potensi Desa Sei Rotan",
    "subtitle": "Kaya akan Sumber Daya Alam dan UMKM",
    "media_url": "/uploads/hero-video.mp4",
    "media_type": "video",
    "display_order": 2,
    "is_active": true
  }
]
```

### Site Settings

```json
[
  // Profile
  { "setting_key": "village_name", "setting_value": "Sei Rotan", "setting_group": "profile" },
  { "setting_key": "village_head", "setting_value": "Bapak Kepala Desa", "setting_group": "profile" },
  { "setting_key": "village_vision", "setting_value": "Menjadi desa yang maju...", "setting_group": "profile" },
  
  // General
  { "setting_key": "site_name", "setting_value": "Website Desa Sei Rotan", "setting_group": "general" },
  { "setting_key": "contact_email", "setting_value": "info@seirotan.desa.id", "setting_group": "general" },
  
  // Social
  { "setting_key": "facebook_url", "setting_value": "https://facebook.com/seirotan", "setting_group": "social" }
]
```

## 🔒 Security Considerations

1. **File Upload:**
   - Validate file type (image: jpg, png, webp | video: mp4, webm)
   - Limit file size (image: 5MB, video: 50MB)
   - Sanitize filename
   - Store in secure location

2. **Settings:**
   - Validate input
   - Sanitize HTML in text fields
   - Rate limiting on update endpoints

3. **Authorization:**
   - Only admin can manage sliders
   - Only admin can update settings
   - Public can only read active sliders

## 📱 Responsive Design

- Mobile: Single slide, swipe navigation
- Tablet: Single slide, arrow navigation
- Desktop: Full width, auto-play with controls

## ⚡ Performance

- Lazy load images
- Optimize video for web
- Cache settings in frontend
- Use CDN for media files (future)

## 🚀 Future Enhancements

- [ ] Schedule slider (start/end date)
- [ ] Analytics (view count per slider)
- [ ] A/B testing for sliders
- [ ] Multi-language support
- [ ] Image optimization on upload
- [ ] Video thumbnail generation
