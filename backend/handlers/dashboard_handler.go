package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

type DashboardHandler struct {
	newsRepo      repositories.NewsRepository
	officialRepo  repositories.VillageOfficialRepository
	potentialRepo repositories.PotentialRepository
	serviceRepo   repositories.ServiceRepository
	contactRepo   repositories.ContactRepository
	pageViewRepo  repositories.PageViewRepository
	db            interface{ Ping() error } // For database status check
}

// Response types
type DashboardStats struct {
	ContentStats   ContentStats            `json:"content_stats"`
	RecentNews     []RecentNews            `json:"recent_news"`
	RecentContacts []RecentContact         `json:"recent_contacts"`
	Analytics      AnalyticsStats          `json:"analytics"`
	PopularPages   []repositories.PopularPage `json:"popular_pages"`
	SystemInfo     *SystemInfo             `json:"system_info,omitempty"`
}

type ContentStats struct {
	TotalNews      int64 `json:"total_news"`
	TotalOfficials int64 `json:"total_officials"`
	TotalPotentials int64 `json:"total_potentials"`
	TotalServices  int64 `json:"total_services"`
	TotalContacts  int64 `json:"total_contacts"`
	UnreadContacts int64 `json:"unread_contacts"`
}

type AnalyticsStats struct {
	TodayViews      int64 `json:"today_views"`
	TodayVisitors   int64 `json:"today_visitors"`
	WeekViews       int64 `json:"week_views"`
	WeekVisitors    int64 `json:"week_visitors"`
	MonthViews      int64 `json:"month_views"`
	MonthVisitors   int64 `json:"month_visitors"`
}

type RecentNews struct {
	ID          uint64     `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	ImageURL    *string    `json:"image_url"`
	PublishedAt *time.Time `json:"published_at"`
}

type RecentContact struct {
	ID        uint64    `json:"id"`
	Name      string    `json:"name"`
	Subject   string    `json:"subject"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

type SystemInfo struct {
	LastLogin      *time.Time `json:"last_login,omitempty"`
	CurrentUser    string     `json:"current_user"`
	CurrentRole    string     `json:"current_role"`
	AppVersion     string     `json:"app_version"`
	DatabaseStatus string     `json:"database_status"`
}

func NewDashboardHandler(
	newsRepo repositories.NewsRepository,
	officialRepo repositories.VillageOfficialRepository,
	potentialRepo repositories.PotentialRepository,
	serviceRepo repositories.ServiceRepository,
	contactRepo repositories.ContactRepository,
	pageViewRepo repositories.PageViewRepository,
	db interface{ Ping() error },
) *DashboardHandler {
	return &DashboardHandler{
		newsRepo:      newsRepo,
		officialRepo:  officialRepo,
		potentialRepo: potentialRepo,
		serviceRepo:   serviceRepo,
		contactRepo:   contactRepo,
		pageViewRepo:  pageViewRepo,
		db:            db,
	}
}

// GetStats returns dashboard statistics
func (h *DashboardHandler) GetStats(c *gin.Context) {
	stats := DashboardStats{}

	// Get content stats
	stats.ContentStats = h.getContentStats()

	// Get recent news (5 latest)
	stats.RecentNews = h.getRecentNews(5)

	// Get recent contacts (5 latest)
	stats.RecentContacts = h.getRecentContacts(5)

	// Get analytics stats
	stats.Analytics = h.getAnalyticsStats()

	// Get popular pages (top 5, last 30 days)
	stats.PopularPages = h.getPopularPages(5, 30)

	// Get system info
	stats.SystemInfo = h.getSystemInfo(c)

	c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandler) getContentStats() ContentStats {
	stats := ContentStats{}

	// Count all content types (ignore errors, default to 0)
	stats.TotalNews, _ = h.newsRepo.Count()
	stats.TotalOfficials, _ = h.officialRepo.Count()
	stats.TotalPotentials, _ = h.potentialRepo.Count()
	stats.TotalServices, _ = h.serviceRepo.Count()
	stats.TotalContacts, _ = h.contactRepo.Count()
	stats.UnreadContacts, _ = h.contactRepo.CountUnread()

	return stats
}

func (h *DashboardHandler) getRecentNews(limit int) []RecentNews {
	news, err := h.newsRepo.GetRecent(limit)
	if err != nil {
		return []RecentNews{}
	}

	result := make([]RecentNews, len(news))
	for i, n := range news {
		result[i] = RecentNews{
			ID:          n.ID,
			Title:       n.Title,
			Slug:        n.Slug,
			ImageURL:    n.FeaturedImageURL,
			PublishedAt: n.PublishedAt,
		}
	}

	return result
}

func (h *DashboardHandler) getRecentContacts(limit int) []RecentContact {
	contacts, err := h.contactRepo.GetRecent(limit)
	if err != nil {
		return []RecentContact{}
	}

	result := make([]RecentContact, len(contacts))
	for i, c := range contacts {
		result[i] = RecentContact{
			ID:        c.ID,
			Name:      c.Name,
			Subject:   c.Subject,
			IsRead:    false, // TODO: Update when is_read field is added
			CreatedAt: c.CreatedAt,
		}
	}

	return result
}

func (h *DashboardHandler) getAnalyticsStats() AnalyticsStats {
	stats := AnalyticsStats{}
	now := time.Now()

	// Today
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	stats.TodayViews, _ = h.pageViewRepo.CountViews(todayStart, now)
	stats.TodayVisitors, _ = h.pageViewRepo.CountUniqueVisitors(todayStart, now)

	// This week (last 7 days)
	weekStart := now.AddDate(0, 0, -7)
	stats.WeekViews, _ = h.pageViewRepo.CountViews(weekStart, now)
	stats.WeekVisitors, _ = h.pageViewRepo.CountUniqueVisitors(weekStart, now)

	// This month (last 30 days)
	monthStart := now.AddDate(0, 0, -30)
	stats.MonthViews, _ = h.pageViewRepo.CountViews(monthStart, now)
	stats.MonthVisitors, _ = h.pageViewRepo.CountUniqueVisitors(monthStart, now)

	return stats
}

func (h *DashboardHandler) getPopularPages(limit int, days int) []repositories.PopularPage {
	since := time.Now().AddDate(0, 0, -days)
	pages, err := h.pageViewRepo.GetPopularPages(limit, since)
	if err != nil {
		return []repositories.PopularPage{}
	}
	return pages
}

func (h *DashboardHandler) getSystemInfo(c *gin.Context) *SystemInfo {
	// Get current user info from context (set by auth middleware)
	username, _ := c.Get("username")
	userRole, _ := c.Get("userRole")

	// Check database status
	dbStatus := "connected"
	if h.db != nil {
		if err := h.db.Ping(); err != nil {
			dbStatus = "disconnected"
		}
	}

	// Application version (can be set from environment or config)
	appVersion := "1.0.0" // Default version

	systemInfo := &SystemInfo{
		CurrentUser:    username.(string),
		CurrentRole:    userRole.(string),
		AppVersion:     appVersion,
		DatabaseStatus: dbStatus,
		// LastLogin is not tracked yet, so we leave it nil
		LastLogin: nil,
	}

	return systemInfo
}
