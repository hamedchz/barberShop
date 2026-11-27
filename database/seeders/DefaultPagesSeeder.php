<?php

namespace Database\Seeders;

use App\Enums\Casts\PageStatus;
use App\Models\Page;
use Illuminate\Database\Seeder;

class DefaultPagesSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAboutPage();
        $this->seedContactPage();
        $this->seedTermsPage();
        $this->seedPrivacyPage();
    }

    /**
     * ایجاد صفحه درباره ما
     */
    private function seedAboutPage(): void
    {
        $page = Page::firstOrCreate(
            ['slug' => 'درباه-ما'],
            [
                'title' => 'درباره ما',
                'excerpt' => 'با مجموعه ما و خدماتی که ارائه می‌دهیم بیشتر آشنا شوید.',
                'status' => PageStatus::DRAFT,
                'show_in_header' => true,
                'show_in_footer' => true,
                'header_order' => null,
                'footer_order' => null,
                'is_system' => true,
                'seo_title' => 'درباره ما',
                'seo_description' => 'آشنایی با مجموعه، اهداف و خدمات ما.',
            ]
        );

        // محتوای صفحات موجود را بازنویسی نکن
        if (!$page->wasRecentlyCreated) {
            return;
        }

        $page->sections()->createMany([
            [
                'type' => 'hero',
                'content' => [
                    'title' => 'درباره مجموعه ما',
                    'subtitle' => 'اینجا جایی برای تجربه کیفیت، تخصص و زیبایی است.',
                    'button_text' => '',
                    'button_url' => '',
                    'image' => '',
                ],
                'settings' => [
                    'alignment' => 'center',
                    'background' => 'primary',
                    'height' => 'medium',
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'type' => 'text',
                'content' => [
                    'title' => 'داستان ما',
                    'body' => 'ما با هدف ارائه تجربه‌ای حرفه‌ای و آسان در زمینه خدمات آرایش و پیرایش فعالیت می‌کنیم.

در این مجموعه تلاش می‌کنیم ارتباط میان مشتریان و آرایشگران را ساده‌تر کنیم تا کاربران بتوانند خدمات موردنظر خود را انتخاب کرده و در زمان مناسب نوبت رزرو کنند.

کیفیت خدمات، احترام به مشتری و ایجاد تجربه‌ای رضایت‌بخش از مهم‌ترین ارزش‌های ما هستند.',
                ],
                'settings' => [
                    'alignment' => 'right',
                    'width' => 'normal',
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'type' => 'features',
                'content' => [
                    'title' => 'ارزش‌های ما',
                    'items' => [
                        [
                            'title' => 'کیفیت خدمات',
                            'description' => 'توجه به کیفیت و رضایت مشتری در تمام مراحل ارائه خدمات.',
                            'icon' => 'award',
                        ],
                        [
                            'title' => 'رزرو آسان',
                            'description' => 'امکان مشاهده خدمات و انتخاب زمان مناسب برای رزرو نوبت.',
                            'icon' => 'calendar-check',
                        ],
                        [
                            'title' => 'تخصص و تجربه',
                            'description' => 'اهمیت دادن به مهارت و تخصص در ارائه خدمات آرایش و پیرایش.',
                            'icon' => 'scissors',
                        ],
                    ],
                ],
                'settings' => [
                    'columns' => 3,
                ],
                'sort_order' => 3,
                'is_active' => true,
            ],
        ]);
    }

    /**
     * ایجاد صفحه تماس با ما
     */
    private function seedContactPage(): void
    {
        $page = Page::firstOrCreate(
            ['slug' => 'تماس-با-ما'],
            [
                'title' => 'تماس با ما',
                'excerpt' => 'برای دریافت راهنمایی و ارتباط با مجموعه با ما در تماس باشید.',
                'status' => PageStatus::DRAFT,
                'show_in_header' => true,
                'show_in_footer' => true,
                'header_order' => null,
                'footer_order' => null,
                'is_system' => true,
                'seo_title' => 'تماس با ما',
                'seo_description' => 'اطلاعات تماس و راه‌های ارتباط با مجموعه.',
            ]
        );

        // محتوای صفحات موجود را بازنویسی نکن
        if (!$page->wasRecentlyCreated) {
            return;
        }

        $page->sections()->createMany([
            [
                'type' => 'hero',
                'content' => [
                    'title' => 'با ما در ارتباط باشید',
                    'subtitle' => 'پاسخ‌گوی سوالات و پیشنهادهای شما هستیم.',
                    'button_text' => '',
                    'button_url' => '',
                    'image' => '',
                ],
                'settings' => [
                    'alignment' => 'center',
                    'background' => 'primary',
                    'height' => 'medium',
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'type' => 'contact_info',
                'content' => [
                    'title' => 'اطلاعات تماس',
                    'phone' => '',
                    'email' => '',
                    'address' => '',
                    'working_hours' => '',
                ],
                'settings' => [
                    'layout' => 'grid',
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'type' => 'contact_form',
                'content' => [
                    'title' => 'پیام خود را برای ما ارسال کنید',
                    'description' => 'اگر سوال، پیشنهاد یا انتقادی دارید، از طریق فرم زیر با ما در ارتباط باشید.',
                ],
                'settings' => [
                    'show_email' => true,
                    'show_subject' => true,
                ],
                'sort_order' => 3,
                'is_active' => true,
            ],
        ]);
    }


    /**
     * ایجاد صفحه قوانین و مقررات
     */
    private function seedTermsPage(): void
    {
        $page = Page::firstOrCreate(
            ['slug' => 'قوانین-مقررات'],
            [
                'title' => 'قوانین و مقررات',
                'excerpt' => 'شرایط و ضوابط استفاده از خدمات مجموعه.',
                'status' => PageStatus::DRAFT,
                'show_in_header' => false,
                'show_in_footer' => true,
                'header_order' => null,
                'is_system' => true,
                'footer_order' => 3,
                'seo_title' => 'قوانین و مقررات',
                'seo_description' => 'قوانین و شرایط استفاده از خدمات و سامانه.',
            ]
        );

        if (!$page->wasRecentlyCreated) {
            return;
        }

        $page->sections()->createMany([
            [
                'type' => 'hero',
                'content' => [
                    'title' => 'قوانین و مقررات',
                    'subtitle' => 'لطفاً پیش از استفاده از خدمات، شرایط و ضوابط زیر را مطالعه کنید.',
                    'button_text' => '',
                    'button_url' => '',
                    'image' => '',
                ],
                'settings' => [
                    'alignment' => 'center',
                    'background' => 'primary',
                    'height' => 'medium',
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'type' => 'text',
                'content' => [
                    'title' => 'شرایط استفاده از خدمات',
                    'body' => "۱. پذیرش قوانین\n\nاستفاده از خدمات این سامانه به منزله مطالعه و پذیرش قوانین و مقررات آن است. کاربران موظف هستند پیش از ثبت‌نام و استفاده از خدمات، این شرایط را مطالعه کنند.\n\n۲. اطلاعات کاربران\n\nکاربران مسئول صحت اطلاعاتی هستند که هنگام ثبت‌نام و استفاده از سامانه وارد می‌کنند. اطلاعات نادرست ممکن است باعث اختلال در ارائه خدمات شود.\n\n۳. رزرو نوبت\n\nکاربران باید هنگام رزرو نوبت، اطلاعات خدمات، آرایشگر، تاریخ و ساعت انتخاب‌شده را بررسی کنند. ثبت رزرو تابع شرایط اعلام‌شده در سامانه است.\n\n۴. پرداخت و بازپرداخت\n\nپرداخت هزینه خدمات از طریق روش‌های پرداخت ارائه‌شده در سامانه انجام می‌شود. شرایط لغو رزرو و بازپرداخت مطابق قوانین اعلام‌شده در سامانه خواهد بود.\n\n۵. مسئولیت کاربران\n\nکاربران موظف هستند از سامانه به شکل قانونی استفاده کنند و از هرگونه اقدام مخرب، ایجاد اختلال یا سوءاستفاده از خدمات خودداری کنند.\n\n۶. تغییر قوانین\n\nمجموعه می‌تواند در صورت نیاز قوانین و مقررات را به‌روزرسانی کند. نسخه جدید پس از انتشار در همین صفحه قابل مشاهده خواهد بود.\n\n۷. ارتباط با مجموعه\n\nدر صورت وجود هرگونه سؤال درباره قوانین و مقررات، کاربران می‌توانند از طریق صفحه تماس با ما با مجموعه ارتباط برقرار کنند.",
                ],
                'settings' => [
                    'alignment' => 'right',
                    'width' => 'wide',
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
        ]);
    }

    /**
     * ایجاد صفحه حریم خصوصی
     */
    private function seedPrivacyPage(): void
    {
        $page = Page::firstOrCreate(
            ['slug' => 'حریم-خصوصی'],
            [
                'title' => 'حریم خصوصی',
                'excerpt' => 'نحوه جمع‌آوری، نگهداری و استفاده از اطلاعات کاربران.',
                'status' => PageStatus::DRAFT,
                'show_in_header' => false,
                'show_in_footer' => true,
                'header_order' => null,
                'is_system' => true,
                'footer_order' => 4,
                'seo_title' => 'حریم خصوصی',
                'seo_description' => 'سیاست حفظ حریم خصوصی و حفاظت از اطلاعات کاربران.',
            ]
        );

        if (!$page->wasRecentlyCreated) {
            return;
        }

        $page->sections()->createMany([
            [
                'type' => 'hero',
                'content' => [
                    'title' => 'حریم خصوصی کاربران',
                    'subtitle' => 'حفظ امنیت و احترام به اطلاعات شخصی شما برای ما اهمیت دارد.',
                    'button_text' => '',
                    'button_url' => '',
                    'image' => '',
                ],
                'settings' => [
                    'alignment' => 'center',
                    'background' => 'primary',
                    'height' => 'medium',
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'type' => 'text',
                'content' => [
                    'title' => 'سیاست حفظ حریم خصوصی',
                    'body' => "۱. اطلاعاتی که دریافت می‌کنیم\n\nبرای ارائه خدمات، ممکن است اطلاعاتی مانند نام، شماره تلفن، اطلاعات حساب کاربری و اطلاعات مربوط به رزروهای شما دریافت و نگهداری شود.\n\n۲. هدف از جمع‌آوری اطلاعات\n\nاطلاعات کاربران برای ایجاد و مدیریت حساب کاربری، ثبت و پیگیری رزروها، ارائه خدمات، پشتیبانی و بهبود عملکرد سامانه استفاده می‌شود.\n\n۳. حفاظت از اطلاعات\n\nمجموعه تلاش می‌کند با استفاده از تدابیر فنی و امنیتی مناسب، از دسترسی غیرمجاز، افشا، تغییر یا از بین رفتن اطلاعات کاربران جلوگیری کند.\n\n۴. دسترسی اشخاص ثالث\n\nاطلاعات کاربران بدون مبنای قانونی یا رضایت لازم در اختیار اشخاص ثالث قرار نمی‌گیرد. با این حال، ارائه برخی خدمات مانند پرداخت آنلاین ممکن است مستلزم تبادل اطلاعات ضروری با ارائه‌دهندگان خدمات مربوط باشد.\n\n۵. نگهداری اطلاعات\n\nاطلاعات کاربران تا زمانی که برای ارائه خدمات، انجام تعهدات قانونی یا حل اختلافات لازم باشد، نگهداری خواهد شد.\n\n۶. حقوق کاربران\n\nکاربران می‌توانند برای اصلاح اطلاعات شخصی خود یا طرح درخواست‌های مرتبط با حریم خصوصی، از طریق راه‌های ارتباطی مجموعه اقدام کنند.\n\n۷. تغییر سیاست حریم خصوصی\n\nممکن است این سیاست در آینده به‌روزرسانی شود. نسخه جدید از طریق همین صفحه در دسترس کاربران قرار خواهد گرفت.\n\n۸. ارتباط با ما\n\nبرای طرح سؤال یا درخواست درباره حریم خصوصی و اطلاعات شخصی خود، از صفحه تماس با ما استفاده کنید.",
                ],
                'settings' => [
                    'alignment' => 'right',
                    'width' => 'wide',
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
        ]);
    }
}
