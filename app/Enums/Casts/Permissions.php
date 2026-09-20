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

  public static function toArray(): array
  {
    return array_map(fn($status) => $status->value, self::cases());
  }
}
