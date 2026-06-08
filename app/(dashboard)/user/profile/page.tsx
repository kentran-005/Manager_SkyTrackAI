"use client";

import { useAuth } from "@/lib/authContext";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Plane,
  Bell,
  Settings,
  Camera,
  Edit3,
  LogOut,
  Globe,
  Phone,
  MapPin,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [flightAlerts, setFlightAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);

  return (
    <div className="udash-profile-page">
      <div className="udash-page-header">
        <div>
          <h1 className="udash-page-title">Profile</h1>
          <p className="udash-page-sub">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="udash-profile-grid">
        {/* Profile Card */}
        <div className="udash-profile-card">
          <div className="udash-profile-card-banner" />
          <div className="udash-profile-card-body">
            <div className="udash-profile-avatar-wrap">
              <div className="udash-profile-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <button className="udash-profile-avatar-edit">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="udash-profile-name">{user?.name || "User"}</h2>
            <p className="udash-profile-email">{user?.email}</p>
            <span className="udash-profile-role-badge">
              <Shield className="w-3.5 h-3.5" />
              {user?.role === "ADMIN" ? "Administrator" : "Premium User"}
            </span>

            <div className="udash-profile-stats-row">
              <div className="udash-profile-stat">
                <Plane className="w-4 h-4 text-blue-500" />
                <span className="udash-profile-stat-value">12</span>
                <span className="udash-profile-stat-label">Tracked Flights</span>
              </div>
              <div className="udash-profile-stat">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="udash-profile-stat-value">5</span>
                <span className="udash-profile-stat-label">Alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="udash-profile-details">
          <div className="udash-profile-section">
            <div className="udash-profile-section-header">
              <h3>Account Information</h3>
              <button className="udash-profile-edit-btn">
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
            <div className="udash-profile-fields">
              <div className="udash-profile-field">
                <User className="w-4 h-4" />
                <div>
                  <span className="udash-profile-field-label">Full Name</span>
                  <span className="udash-profile-field-value">{user?.name || "Not set"}</span>
                </div>
              </div>
              <div className="udash-profile-field">
                <Mail className="w-4 h-4" />
                <div>
                  <span className="udash-profile-field-label">Email Address</span>
                  <span className="udash-profile-field-value">{user?.email}</span>
                </div>
              </div>
              <div className="udash-profile-field">
                <Phone className="w-4 h-4" />
                <div>
                  <span className="udash-profile-field-label">Phone Number</span>
                  <span className="udash-profile-field-value">+84 912 345 678</span>
                </div>
              </div>
              <div className="udash-profile-field">
                <MapPin className="w-4 h-4" />
                <div>
                  <span className="udash-profile-field-label">Location</span>
                  <span className="udash-profile-field-value">Ho Chi Minh City, Vietnam</span>
                </div>
              </div>
              <div className="udash-profile-field">
                <Globe className="w-4 h-4" />
                <div>
                  <span className="udash-profile-field-label">Language</span>
                  <span className="udash-profile-field-value">English (US)</span>
                </div>
              </div>
              <div className="udash-profile-field">
                <Calendar className="w-4 h-4" />
                <div>
                  <span className="udash-profile-field-label">Member Since</span>
                  <span className="udash-profile-field-value">January 2025</span>
                </div>
              </div>
            </div>
          </div>

          <div className="udash-profile-section">
            <div className="udash-profile-section-header">
              <h3>Preferences</h3>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>
            <div className="udash-profile-prefs">
              <div className="udash-profile-pref-item">
                <div>
                  <span className="udash-profile-pref-label">Email Notifications</span>
                  <span className="udash-profile-pref-desc">Receive flight alerts via email</span>
                </div>
                <label className="udash-profile-toggle">
                  <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                  <span className="udash-profile-toggle-slider" />
                </label>
              </div>
              <div className="udash-profile-pref-item">
                <div>
                  <span className="udash-profile-pref-label">Push Notifications</span>
                  <span className="udash-profile-pref-desc">Get browser push notifications</span>
                </div>
                <label className="udash-profile-toggle">
                  <input type="checkbox" checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
                  <span className="udash-profile-toggle-slider" />
                </label>
              </div>
              <div className="udash-profile-pref-item">
                <div>
                  <span className="udash-profile-pref-label">Flight Status Alerts</span>
                  <span className="udash-profile-pref-desc">Notify when tracked flights change status</span>
                </div>
                <label className="udash-profile-toggle">
                  <input type="checkbox" checked={flightAlerts} onChange={() => setFlightAlerts(!flightAlerts)} />
                  <span className="udash-profile-toggle-slider" />
                </label>
              </div>
              <div className="udash-profile-pref-item">
                <div>
                  <span className="udash-profile-pref-label">Price Drop Alerts</span>
                  <span className="udash-profile-pref-desc">Notify when flight prices drop</span>
                </div>
                <label className="udash-profile-toggle">
                  <input type="checkbox" checked={priceAlerts} onChange={() => setPriceAlerts(!priceAlerts)} />
                  <span className="udash-profile-toggle-slider" />
                </label>
              </div>
              <div className="udash-profile-pref-item">
                <div>
                  <span className="udash-profile-pref-label">Dark Mode</span>
                  <span className="udash-profile-pref-desc">Use dark theme</span>
                </div>
                <label className="udash-profile-toggle">
                  <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                  <span className="udash-profile-toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          <button className="udash-profile-logout" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}