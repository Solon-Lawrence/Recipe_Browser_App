# Recipe_Browser_App

## Local Spoonacular setup

For development on XAMPP, place your Spoonacular key in `config.local.php`:

```php
<?php
define('SPOONACULAR_API_KEY', 'your_real_key_here');
```

The app will load that file automatically through `spoonacular_proxy.php`, so the key stays off the frontend.

