<?php

namespace App\Enums\Casts;

enum Permissions: string
{
  case manageUsers = 'manage-users';
  case manageRoles = 'manage-roles';
  case manageBlog = 'manage-blog';
  case manageProducts = 'manage-products';
  case manageComment = 'manage-comments';
  case manageSeo = 'manage-seo';
  case manageProductsInfo = 'manage-product-info';
  case manageBlogCategory = 'manage-blog-category';
  case manageAboutus = 'manage-about-us';
  case manageContactus = 'manage-contact-us';
  case manageProjects = 'manage-projects';
  case manageGeneralSettings = 'manage-general-settings';
  case MemberDashboardPanel = 'member-dashboard-panel';
  case CustomerDashboardPanel = 'customer-dashboard-panel';
  case AdminDashboardPanel = 'admin-dashboard-panel';
  case managePackages = 'manage-packages';
  case manageAdmins = 'manage-admins';
  case manageOrder = 'manage-order';
  case manageBarber = 'manage-barber';
  case barberDashboardPanel = 'barber-dashboard-panel';
  case manageFinance = 'manage-finance';
  case manageDeposits = 'manage-deposits';
  case manageBookings = 'manage-bookings';
  case manageDisputes = 'manage-disputes';
  case manageNeedsAttention = 'manage-needs-attention';
  case manageNotifications = 'manage-notifications';


  public function description(): string
  {
    return match ($this) {
      self::manageUsers => 'مدیریت کاربران',
      self::manageFinance => 'مدیریت مالی',
      self::manageRoles => 'مدیریت نقش‌ها و دسترسی‌ها',
      self::manageBlog => 'مدیریت مطالب وبلاگ',
      self::manageProducts => 'مدیریت محصولات',
      self::manageComment => 'مدیریت نظرات',
      self::manageSeo => 'مدیریت تنظیمات سئو',
      self::manageProductsInfo => 'مدیریت اطلاعات محصولات',
      self::manageBlogCategory => 'مدیریت دسته‌بندی‌های وبلاگ',
      self::manageAboutus => 'مدیریت صفحه درباره ما',
      self::manageContactus => 'مدیریت صفحه تماس با ما',
      self::manageProjects => 'مدیریت پروژه‌ها',
      self::manageGeneralSettings => 'مدیریت تنظیمات عمومی',
      self::MemberDashboardPanel => 'دسترسی به پنل اعضا',
      self::CustomerDashboardPanel => 'دسترسی به پنل مشتریان',
      self::AdminDashboardPanel => 'دسترسی به پنل مدیریت',
      self::managePackages => 'مدیریت پکیج‌ها',
      self::manageAdmins => 'مدیریت مدیران',
      self::manageOrder => 'مدیریت سفارش‌ها',
      self::manageBarber => 'مدیریت آرایشگران',
      self::barberDashboardPanel => 'دسترسی به پنل آرایشگر',
      self::manageDeposits => 'مدیریت شارژها',
      self::manageBookings => 'مدیریت رزروها',
      self::manageDisputes => 'مدیریت اعتراض  ها',
      self::manageNeedsAttention => 'مدیریت موارد نیازمند رسیدگی',
      self::manageNotifications => 'مدیریت اعلان ها',
    };
  }

  public static function toArray(): array
  {
    return array_map(
      fn(self $permission) => $permission->value,
      self::cases()
    );
  }

  public static function descriptions(): array
  {
    $descriptions = [];

    foreach (self::cases() as $permission) {
      $descriptions[$permission->value] = $permission->description();
    }

    return $descriptions;
  }
}
