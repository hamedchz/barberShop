<?php

namespace App\Enums\Casts;


enum Roles: string
{

  case user = 'user';
  case Customer = 'customer';
  case Member = 'member';
  case admin = 'admin';
  case superAdmin = 'super-admin';
  case writer = 'writer';


  // extra helper to allow for greater customization of displayed values, without disclosing the name/value data directly
  public function label(): string
  {
    return match ($this) {
      Roles::writer => 'Writers',
      Roles::user => 'Users',
      Roles::admin => 'Admins',
      Roles::Member => 'Member',
      Roles::Customer => 'Customer',
      Roles::superAdmin => 'Super admin',
    };
  }
}
