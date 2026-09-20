<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rulde. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute باید پذیرفته شود.',
    'active_url' => ':attribute یک URL معتبر نیست.',
    'after' => ':attribute باید تاریخی بعد از :date باشد.',
    'after_or_equal' => ':attribute باید تاریخی بعد از یا برابر با :date باشد.',
    'alpha' => ':attribute می‌تواند فقط شامل حروف باشد.',
    'alpha_dash' => ':attribute می‌تواند فقط شامل حروف، اعداد و خط تیره باشد.',
    "ascii_only" => ":attribute می‌تواند فقط شامل حروف، اعداد و خط تیره باشد.  ",
    'alpha_num' => ':attribute می‌تواند فقط شامل حروف و اعداد باشد.',
    'array' => ':attribute باید یک آرایه باشد.',
    'before' => ':attribute باید تاریخی قبل از :date باشد.',
    'before_or_equal' => ':attribute باید تاریخی قبل از یا برابر با :date باشد.',
    'between'              => [
        'numeric' => ':attribute باید بین :min و :max باشد.',
        'file' => ':attribute باید بین :min و :max کیلوبایت باشد.',
        'string' => ':attribute باید بین :min و :max کاراکتر باشد.',
        'array' => ':attribute باید بین :min و :max آیتم داشته باشد.',
    ],
    'boolean' => 'فیلد :attribute باید درست یا نادرست باشد.',
    'confirmed' => 'تأییدیه :attribute مطابقت ندارد.',
    'date' => ':attribute یک تاریخ معتبر نیست.',
    'date_format' => ':attribute با فرمت :format مطابقت ندارد.',
    'different' => ':attribute و :other باید متفاوت باشند.',
    'digits' => ':attribute باید :digits رقم باشد.',
    'digits_between' => ':attribute باید بین :min و :max رقم باشد.',
    'dimensions' => ':attribute ابعاد تصویر نامعتبر (:min_width x :min_height px) دارد.',
    'distinct' => 'فیلد :attribute دارای یک مقدار تکراری است.',
    'email' => ':attribute باید یک آدرس ایمیل معتبر باشد.',
    'exists' => ':attribute انتخاب شده نامعتبر است.',
    'file' => ':attribute باید یک فایل باشد.',
    'filled' => 'فیلد :attribute باید دارای یک مقدار باشد.',
    'gt'                   => [
        'numeric' => ':attribute باید بزرگتر از :value باشد.',
        'file' => ':attribute باید بزرگتر از :value کیلوبایت باشد.',
        'string' => ':attribute باید بزرگتر از :value کاراکتر باشد.',
        'array' => ':attribute باید بیش از :value آیتم داشته باشد.',
    ],
    'gte'                  => [
        'numeric' => ':attribute باید بزرگتر از یا برابر با :value باشد.',
        'file' => ':attribute باید بزرگتر از یا برابر با :value کیلوبایت باشد.',
        'string' => ':attribute باید بزرگتر از یا برابر با :value کاراکتر باشد.',
        'array' => ':attribute باید :value آیتم یا بیشتر داشته باشد.',
    ],
    'image' => ':attribute باید یک تصویر باشد.',
    'in' => ':attribute انتخاب شده نامعتبر است.',
    'in_array' => 'فیلد :attribute در :other وجود ندارد.',
    'integer' => ':attribute باید یک عدد صحیح باشد.',
    'ip' => ':attribute باید یک آدرس IP معتبر باشد.',
    'ipv4' => ':attribute باید یک آدرس IPv4 معتبر باشد.',
    'ipv6' => ':attribute باید یک آدرس IPv6 معتبر باشد.',
    'json' => ':attribute باید یک رشته JSON معتبر باشد.',
    'lt'                   => [
        'numeric' => ':attribute باید کمتر از :value باشد.',
        'file' => ':attribute باید کمتر از :value کیلوبایت باشد.',
        'string' => ':attribute باید کمتر از :value کاراکتر باشد.',
        'array' => ':attribute باید کمتر از :value آیتم داشته باشد.',
    ],
    'lte'                  => [
        'numeric' => ':attribute باید کمتر از یا برابر با :value باشد.',
        'file' => ':attribute باید کمتر از یا برابر با :value کیلوبایت باشد.',
        'string' => ':attribute باید کمتر از یا برابر با :value کاراکتر باشد.',
        'array' => ':attribute نباید بیش از :value آیتم داشته باشد.',
    ],
    'max'                  => [
        'numeric' => ':attribute نمیتواند بزرگتر از :max باشد.',
        'file' => ':attribute نمیتواند بزرگتر از :max کیلوبایت باشد.',
        'string' => ':attribute نمیتواند بیشتر از :max کاراکتر باشد.',
        'array' => ':attribute نمیتواند بیش از :max آیتم نداشته باشد.',
    ],
    'mimes' => ':attribute باید فایلی از نوع :values باشد.',
    'mimetypes' => ':attribute باید فایلی از نوع :values باشد.',
    'min'                  => [
        'numeric' => ':attribute باید حداقل :min باشد.',
        'file' => ':attribute باید حداقل :min کیلوبایت باشد.',
        'string' => ':attribute باید حداقل :min کاراکتر باشد.',
        'array' => ':attribute باید حداقل :min آیتم داشته باشد.',
    ],
    'not_in' => ':attribute انتخاب شده نامعتبر است.',
    'not_regex' => 'فرمت :attribute نامعتبر است.',
    'numeric' => ':attribute باید یک عدد باشد.',
    'present' => 'فیلد :attribute باید وجود داشته باشد.',
    'regex' => 'فرمت :attribute نامعتبر است.',
    'required' => 'فیلد :attribute الزامی است.',
    'required_if' => 'فیلد :attribute زمانی الزامی است که :other برابر با :value باشد.',
    'required_unless' => 'فیلد :attribute الزامی است مگر اینکه :other در :values باشد.',
    'required_with' => 'فیلد :attribute زمانی الزامی است که :values وجود داشته باشد.',
    'required_with_all' => 'فیلد :attribute زمانی الزامی است که :values وجود داشته باشد.',
    'required_without' => 'فیلد :attribute زمانی الزامی است که :values وجود نداشته باشد.',
    'required_without_all' => 'فیلد :attribute زمانی الزامی است که هیچ‌یک از :values وجود نداشته باشد.',
    'same' => ':attribute و :other باید مطابقت داشته باشند.',
    'size'                 => [
        'numeric' => ':attribute باید :size باشد.',
        'file' => ':attribute باید :size کیلوبایت باشد.',
        'string' => ':attribute باید :size کاراکتر باشد.',
        'array' => ':attribute باید شامل :size آیتم باشد.',
    ],
    'string' => ':attribute باید یک رشته باشد.',
    'timezone' => ':attribute باید یک ناحیه معتبر باشد.',
    'unique' => ':attribute نمیتواند تکراری باشد.',
    'uploaded' => ':attribute بارگذاری ناموفق بود.',
    'url' => 'فرمت :attribute نامعتبر است.',
    "account_not_confirmed" => "حساب شما تأیید نشده است، لطفاً ایمیل خود را بررسی کنید.  ",
    "user_suspended" => "حساب شما معلق شده است، در صورت بروز خطا با ما تماس بگیرید.  ",
    "letters" => ":attribute باید حداقل شامل یک حرف یا عدد باشد.  ",
    'video_url' => 'URL نامعتبر است و تنها از یوتیوب و ویمئو پشتیبانی می‌کند.',
    'update_max_length' => 'پست نباید بیشتر از :max کاراکتر باشد.',
    'update_min_length' => 'پست باید حداقل :min کاراکتر باشد.',
    'video_url_required' => 'فیلد URL ویدیو زمانی الزامی است که محتوای ویژه ویدیو باشد.',
    "currency_no_match_bank" => "ارز حساب بانکی انتخابی با ارز کیف پول مطابقت ندارد.",

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the linde. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'پیام سفارشی',
        ],
        'parent_id' => [
            'required_unless' => 'فیلد دسته بندی اصلی الزامی است مگر اینکه گزینه "این یک گروه اصلی است" در حالت انتخاب باشد',
        ],
        'published_at' => [
            'after_or_equal' => 'تاریخ انتشار باید برابر یا بزرگتر از تاریخ الان باشد',
        ],
        'attachment' => [
            'mimes' => 'لطفاً فایل با پسوند های پشتیبانی شده را انتخاب کنید',
        ],
        'description' => [
            'minlength' =>  ' توضیحات باید حداقل :min کاراکتر باشد (تعداد کاراکترهای مورد استفاده :current میباشد)',

        ],
        'username' => [
            'lowercase' => 'نام کاربری باید حروف کوچک باشد'
        ],
        'end_time' => [
            'after' => 'زمان پایان باید بعد از زمان شروع باشد',
        ],
        'password' => [
            'same' => 'رمز عبور و تایید رمز عبور  مطابقت  ندارد.',
        ],
        'paymentWallet' => [
            'required' => 'لطفا یک کیف پول را انتخاب کنید',
        ],
        'acceptTerms' => [
            'accepted' => 'لطفاً برای ادامه شرایط و ضوابط را بپذیرید.',
        ],
        'phone' => [
            'unique' => 'این شماره تلفن قبلا  گرفته شده است',
        ],


    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap attribute place-holders
    | with something more reader friendly such as E-Mail Address instead
    | of "email". This simply helps us make messages a little cleaner.
    |
    */

    'attributes' => [
        'slug' => 'نامک',
        'schema_code' => 'کد اسکیما',
        'date' => 'تاریخ',
        'content' => 'محتوا',
        "search_term" => "جستجو",
        'national_code' => "کد ملی",
        'certificate_code' => "شماره گواهینامه",
        'certificate_url' => "تصویر گواهینامه",
        'phone' => "تلفن",
        'agree_gdpr' => 'با پردازش داده‌های شخصی موافقم',
        'agree_terms' => 'با شرایط و ضوابط موافقم',
        'agree_terms_privacy' => 'با شرایط و ضوابط و سیاست حفظ حریم خصوصی موافقم',
        'full_name' => 'نام کامل',
        'name' => 'نام',
        'username' => 'نام کاربری',
        'username_email' => 'نام کاربری یا ایمیل',
        'email' => 'ایمیل',
        'password' => 'رمز عبور',
        'password_confirmation' => 'تأیید رمز عبور',
        'website' => 'وب‌سایت',
        'location' => 'مکان',
        'countries_id' => 'کشور',
        'twitter' => 'توییتر',
        'facebook' => 'فیسبوک',
        'google' => 'گوگل',
        'instagram' => 'اینستاگرام',
        'comment' => 'نظر',
        'title' => 'عنوان',
        'description' => 'توضیحات',
        'old_password' => 'رمز عبور قدیمی',
        'new_password' => 'رمز عبور جدید',
        'email_paypal' => 'ایمیل پی‌پل',
        'email_paypal_confirmation' => 'تأیید ایمیل پی‌پل',
        'bank_details' => 'جزئیات بانکی',
        'video_url' => 'لینک ویدیو',
        'categories_id' => 'دسته‌بندی',
        'story' => 'داستان',
        'image' => 'تصویر',
        'avatar' => 'آواتار',
        'message' => 'پیام',
        'profession' => 'حرفه',
        'thumbnail' => 'تصویر بندانگشتی',
        'address' => 'آدرس',
        'city' => 'شهر',
        'zip' => 'کد پستی',
        'payment_gateway' => 'درگاه پرداخت',
        'payment_gateway_tip' => 'درگاه پرداخت',
        'MAIL_FROM_ADDRESS' => 'ایمیل بدون پاسخ',
        'FILESYSTEM_DRIVER' => 'فضا',
        'price' => 'قیمت',
        'amount' => 'مقدار',
        'birthdate' => 'تاریخ تولد',
        'navbar_background_color' => 'رنگ پس‌زمینه نوار ناوبری',
        'navbar_text_color' => 'رنگ متن نوار ناوبری',
        'footer_background_color' => 'رنگ پس‌زمینه فوتر',
        'footer_text_color' => 'رنگ متن فوتر',
        'register_phone' => 'شماره موبایل',

        'AWS_ACCESS_KEY_ID' => 'کلید آمازون', // Not necessary edit
        'AWS_SECRET_ACCESS_KEY' => 'راز آمازون', // Not necessary edit
        'AWS_DEFAULT_REGION' => 'ناحیه آمازون', // Not necessary edit
        'AWS_BUCKET' => 'سطل آمازون', // Not necessary edit

        'DOS_ACCESS_KEY_ID' => 'کلید دیجیتال اقیانوس', // Not necessary edit
        'DOS_SECRET_ACCESS_KEY' => 'راز دیجیتال اقیانوس', // Not necessary edit
        'DOS_DEFAULT_REGION' => 'ناحیه دیجیتال اقیانوس', // Not necessary edit
        'DOS_BUCKET' => 'سطل دیجیتال اقیانوس', // Not necessary edit

        'WAS_ACCESS_KEY_ID' => 'کلید واسابی', // Not necessary edit
        'WAS_SECRET_ACCESS_KEY' => 'راز واسابی', // Not necessary edit
        'WAS_DEFAULT_REGION' => 'ناحیه واسابی', // Not necessary edit
        'WAS_BUCKET' => 'سطل واسابی', // Not necessary edit

        //===== v2.0
        'BACKBLAZE_ACCOUNT_ID' => 'شناسه حساب بک بلز', // Not necessary edit
        'BACKBLAZE_APP_KEY' => 'کلید برنامه اصلی بک بلز', // Not necessary edit
        'BACKBLAZE_BUCKET' => 'نام سطل بک بلز', // Not necessary edit
        'BACKBLAZE_BUCKET_REGION' => 'ناحیه سطل بک بلز', // Not necessary edit
        'BACKBLAZE_BUCKET_ID' => 'نقطه انتهایی سطل بک بلز', // Not necessary edit

        'VULTR_ACCESS_KEY' => 'کلید ولتر', // Not necessary edit
        'VULTR_SECRET_KEY' => 'راز ولتر', // Not necessary edit
        'VULTR_REGION' => 'ناحیه ولتر', // Not necessary edit
        'VULTR_BUCKET' => 'سطل ولتر', // Not necessary edit
        "picture" => "تصویر",
        'en.slogan' => 'شعار برند انگلیسی',
        'de.slogan' => 'شعار برند آلمانی ',
        'fa.slogan' => 'شعار برند فارسی ',
        'en.content' => ' متن انگلیسی',
        'fa.content' => 'متن فارسی',
        'de.content' => 'متن آلمانی',
        'en.title' => ' عنوان انگلیسی',
        'fa.title' => 'عنوان فارسی',
        'de.title' => 'عنوان آلمانی',
        'en.meta_keyword' => ' کلمه کلیدی انگلیسی',
        'fa.meta_keyword' => 'کلمه کلیدی فارسی',
        'de.meta_keyword' => 'کلمه کلیدی آلمانی',
        'en.meta_description' => ' متا دیسکریپشن انگلیسی',
        'fa.meta_description' => 'متا دیسکریپشن فارسی',
        'de.meta_description' => 'متا دیسکریپشن آلمانی',
        "landing-video" => "ویدیو سایت",
        'en.seo_title' => ' عنوان سئو انگلیسی',
        'fa.seo_title' => 'عنوان سئو فارسی',
        'de.seo_title' => 'عنوان سئو آلمانی',
        'en.landing' => ' متن نمایش صفحه اصلی انگلیسی',
        'fa.landing' => 'متن نمایش صفحه اصلی فارسی',
        'de.landing' => 'متن نمایش صفحه اصلی آلمانی',
        'en.name' => ' نام انگلیسی',
        'fa.name' => 'نام فارسی',
        'de.name' => 'نام آلمانی',
        'first_name' => 'نام',
        'last_name' => 'نام خانوادگی',
        'roles' => 'نقش ها',
        "color" => "رنگ",
        "parent_id" => "دسته بندی اصلی",
        "is_root" => 'گزینه گروه اصلی ',
        "yes" => "در حالت انتخاب",
        'en.question' => ' سوال انگلیسی',
        'fa.question' => 'سوال فارسی',
        'de.question' => 'سوال آلمانی',
        'en.answer' => ' جواب انگلیسی',
        'fa.answer' => 'جواب فارسی',
        'de.answer' => 'جواب آلمانی',
        'permissions' => 'دسترسی',
        'role' => 'نقش',
        'category_id' => "دسته بندی",
        'published_at' => 'تاریخ انتشار',
        "type" => "نوع",
        "duration" => "مدت زمان اعتبار",
        "job_post" => "تعداد پیشنهاد ها",
        "job_highlight" => "تعداد پیشنهاد های برجسته",
        "job_featured" => "تعداد ویژگی‌های شغلی",
        "attachment" => "ضمیمه",
        "sub_category_id" => "زیر دسته بندی",
        "level" => "سطح",
        "skill" => "مهارت",
        "hourly_rate" => "دستمزد هر ساعت",
        "estimated_hours" => "ساعت تخمینی جهت انجام کار",
        "budget" => "بودجه",
        "current_password" => "رمز عبور قبلی",
        "country_id" => "کشور",
        "state_id" => "استان",
        "city_id" => "شهر",
        "language" => "زبان",
        "cover_letter" => "توضیحات",
        "page" => "این صفحه",
        "site_title" => "عنوان سایت",
        "site_fee_commission" => "کمیسیون دریافتی سایت",
        "bid_deadline" => "مهلت ارسال پیشنهاد",
        "client_selection_freelancer_deadline" => "مهلت انتخاب فریلنسر",
        "portfolio_title" => "عنوان نمونه کار",
        "portfolio_description" => "توضیحات نمونه کار",
        'en.text' => ' متن انگلیسی',
        'fa.text' => 'متن فارسی',
        'de.text' => 'متن آلمانی',
        "currency" => "ارز",
        "bankAccount" => "حساب بانکی",
        "subject" => "موضوع",
        "assigned_ids" => "کاربران",
        "user_id" => 'کاربر',


        'es.seo_title' => 'عنوان سئو فارسی',
        'start_time' => 'زمان شروع',
        'end_time' => 'زمان پایان',
        'wage' => 'دستمزد',
        'commission' => 'کمیسیون',
        'es.name' => 'نام اسپانیایی',
        'ar.name' => 'نام عربی',
        'ru.name' => 'نام روسی',
        'en.description' => 'توضیحات انگلیسی',
        'es.description' => 'توضیحات اسپانیایی',
        'fa.description' => 'توضیحات فارسی',
        'ar.description' => 'توضیحات عربی',
        'ru.description' => 'توضیحات روسی',
        'de.description' => 'توضیحات آلمانی',
        'gallery' => 'عکس گالری',
        'video' => 'ویدیو',
        'family' => 'نام خانوادگی',
        'lastname' => 'نام خانوادگی',
        "postcode" => 'کدپستی',
        "wallet" => "کیف پول",
        "balance" => "موجودی",
        "identity_no" => "شناسه کاربری",
        "userLanguage" => "زبان مورد استفاده شما",
        "advisorLanguage" => "زبان مشاور",
        "estimateHours" => "برآورد زمان ",
        "state" => "استان",
        'category' => 'دسته‌بندی',
        "serviceDate" => "تاریخ سرویس",
        "serviceTime" => "زمان سرویس",
        "country_code" => 'کد کشور',
        "languages" => "زبان ها",
        "confirm_password" => "تایید رمز عبور",
        'currency_type' => "نوع حساب",
        'bank_name' => "نام بانک",
        'account_name' => "نام حساب",
        'account_number' => "شماره حساب",
        "reference" => "کد پیگیری",
        "country" => "کشور",
        "countryCode" => 'کد کشور'







    ],

];
