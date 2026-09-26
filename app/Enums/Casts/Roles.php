<?php

namespace App\Enums\Casts;


enum Roles: string
{

  case Customer = 'customer';
  case Barber = 'barber';

  case superAdmin = 'super-admin';



  // extra helper to allow for greater customization of displayed values, without disclosing the name/value data directly
  public function label(): string
  {
    return match ($this) {

      Roles::Barber => 'Barber',
      Roles::Customer => 'Customer',
      Roles::superAdmin => 'Super admin',
    };
  }
}
