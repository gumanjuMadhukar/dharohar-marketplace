<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3005',
        'http://localhost:3000',
        'http://localhost',
        'http://127.0.0.1:3005',
        'http://127.0.0.1:3000',
        'http://127.0.0.1',
        'http://dharohar.local',
        'http://api.dharohar.local',
    ],

    'allowed_origins_patterns' => [
        '#^https?://localhost(:[0-9]+)?$#',
        '#^https?://127\.0\.0\.1(:[0-9]+)?$#',
        '#^https?://.*\.dharohar\.local(:[0-9]+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

