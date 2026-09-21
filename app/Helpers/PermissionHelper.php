<?php

if (!function_exists('translate_permission')) {
  function translate_permission($name)
  {
    $translation = __("permissions.{$name}");

    if ($translation === "permissions.{$name}") {
      $parts = explode('.', $name);
      $humanized = array_map(fn($part) => ucfirst(str_replace('_', ' ', $part)), $parts);
      return implode(' - ', $humanized);
    }

    return $translation;
  }
}

if (!function_exists('reverse_translate_permission')) {
  function reverse_translate_permission($persianText)
  {
    $permissions = trans('permissions');

    if (!is_array($permissions)) {
      return null;
    }

    foreach ($permissions as $key => $value) {
      if (mb_strtolower(trim($value)) === mb_strtolower(trim($persianText))) {
        return $key;
      }
    }

    return null;
  }
}

if (!function_exists('search_permission_keys')) {
  function search_permission_keys($searchTerm)
  {
    $permissions = trans('permissions');

    if (!is_array($permissions)) {
      return [];
    }

    $matchedKeys = [];
    $searchLower = mb_strtolower(trim($searchTerm));

    foreach ($permissions as $key => $value) {
      if (mb_strpos(mb_strtolower($value), $searchLower) !== false) {
        $matchedKeys[] = $key;
      }
      if (mb_strpos(mb_strtolower($key), $searchLower) !== false) {
        $matchedKeys[] = $key;
      }
    }

    return array_unique($matchedKeys);
  }
}
