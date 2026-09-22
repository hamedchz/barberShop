<?php

namespace App\Services;

class GenerateUtf8Slug
{

  function generateUtf8Slug(string $text): string
  {
    // Convert to lowercase (Unicode-safe)
    $text = mb_strtolower($text, 'UTF-8');

    // Replace any non-word character (except Unicode letters, numbers, spaces) with a space
    $text = preg_replace('/[^\p{L}\p{N}\s\-_]/u', ' ', $text);

    // Replace spaces and underscores with hyphens
    $text = preg_replace('/[\s\-_]+/u', '-', $text);

    // Trim hyphens
    $text = trim($text, '-');

    return $text;
  }
}
