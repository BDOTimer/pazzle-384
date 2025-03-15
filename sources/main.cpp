/// #define SFML_STATIC
///----------------------------------------------------------------------------|
/// ...
/// отключить консольное окно: -mwindows
///----------------------------------------------------------------------------:
#include "ui-imgui.h"
#include "nano-test.h"
#include "gen-img.h"
#include "task384.h"


///---------------------------------|
/// Это прототип ресурса.           |
///---------------------------------:
struct  HeroTest : sf::RectangleShape
{       HeroTest()
        {   setFillColor   (sf::Color(0,128,0));
            setSize        ({700, 450}        );
            setOutlineColor(sf::Color(222,0,0));
            setOutlineThickness           (5.f);
            setOrigin({getSize().x / 2, getSize().y / 2});
        }

    TEST
    {   HeroTest hero ;
        SHOW    (hero);
    }
};

///----------------------------------------------------------------------------|
/// Render.
///----------------------------------------------------------------------------:
struct  Render
{       Render() :  window(sf::VideoMode({1200, 800})
                 ,  Config::get().getVersion())
                 ,  ui            (window)
                 ,  text          (font  )
                 ,  drawLoadImages(images)
                 ,  task384       (images)
        {
            window.setFramerateLimit(60);

            camUI = window.getView();

            const int W = 1200;

            camWorld = camUI;
            camWorld.setCenter({0,0});
            camWorld.setSize  ({W, W * 800 / 1200});
            camWorld.zoom     ( 0.7f);

            if(!font.openFromFile("consola.ttf"))
            {   ASSERTM(false, "openFromFile(\"*.ttf\") is failed ...")
            }

            text.setFont                  (font);
            text.setCharacterSize           (18);
            text.setStyle    (sf::Text::Regular);
            text.setFillColor(sf::Color::Yellow);

            uiAllBind();

        /// test_01();

            loop();
        }

    ///---------------------|
    /// Главное Окно.       |
    ///---------------------:
    sf::RenderWindow  window;

    ///---------------------|
    /// Gui.                |
    ///---------------------:
    uii::UITest           ui;

    sf::Font            font;
    sf::Text            text;
    HeroTest            hero;
    anm::Border       border;

    ///---------------------|
    /// Камеры вида.        |
    ///---------------------:
    sf::View           camUI;
    sf::View        camWorld;

    ///---------------------|
    /// Часы.               |
    ///---------------------:
    sf::Clock          clock;

    ///---------------------|
    /// Целевые.            |
    ///---------------------:
    LoaderImages      images;
    DrawImage drawLoadImages;
    Task384          task384;

    ///-----------------------------------------|
    /// Буфер для всех ТЕСТОВЫХ img.            |
    ///-----------------------------------------:
    tools::ManegerCutterImage manegerCutterImage;

    ///-----------------------------------------|
    /// Указатель с GC.                         |
    ///-----------------------------------------:
    std::unique_ptr<DrawImage>      ptrDrawImage;

    ///-----------------------------------------|
    /// Текущая отображаемая картинка.          |
    ///-----------------------------------------:
    DrawImage*           pImg  = &drawLoadImages;

    bool  done{false};
    bool  fast{false};

    ///-----------------------------------------|
    /// Демо-курсор.                            |
    ///-----------------------------------------:
    std::string MousePosition;
    void process_mouse(const sf::Vector2i& mouse_pos)
    {   std::string    s("XY = [");
                       s += std::to_string(mouse_pos.x) + ", ";
                       s += std::to_string(mouse_pos.y) + "]" ;
        //text.setString(s);
        std::swap(s, MousePosition);
    }

    ///-----------------------------------------|
    /// Главный цикл.                           |
    ///-----------------------------------------:
    void loop()
    {
        ui << uii::Clear{} << "... press '2' or '3' ..."; /// task384.info(100);

        float        timeMixer = 0.1f;
        float elapsedTimeMixer = 0.0f;

        sf::Vector2i mouse_pos;

        ptrDrawImage = std::make_unique<DrawImage>(manegerCutterImage.getNext());

        pImg = &drawLoadImages;

        updCamera(*pImg);

        while (window.isOpen())
        {
            while (const std::optional event = window.pollEvent() )
            {
                ImGui::SFML::ProcessEvent(window, *event);

                using E   = sf::Event;
                using KEY = sf::Keyboard::Scancode;

                if(event->is<sf::Event::Closed>()) window.close();

                if (const auto* keyPressed = event->getIf<E::KeyPressed>())
                {
                    /// ...
                    if(!ui.isAnyFocused        )
                    switch(keyPressed->scancode)
                    {
                        case KEY::C:
                        {   pImg->mixer(20.f);
                            updCamera (*pImg);
                            break;
                        }
                        case KEY::F:   { fooKeyF (); break; }
                        case KEY::Num0:{ fooKey0 (); break; }
                        case KEY::Num1:{ fooKey1 (); break; }
                        case KEY::Num2:{ fooKey2 (); break; }
                        case KEY::Num3:{ fooKey3 (); break; }
                        case KEY::W   :{ fooZoomN(); break; } /// zoom-
                        case KEY::S   :{ fooZoomP(); break; } /// zoom+
                        case KEY::N   :{ fooKeyN (); break; }

                        default:;
                    }
                }

                ///------------------------------------|
                /// MouseMoved только здесь.           |
                ///------------------------------------:
                if(event->is<sf::Event::MouseMoved>())
                {   mouse_pos  =  sf::Mouse::getPosition(window);
                    process_mouse(mouse_pos);
                }

                ///------------------------------------|
                /// Ресайзинг окна.                    |
                ///------------------------------------:
                if ([[maybe_unused]]const auto* resized
                    = event->getIf<sf::Event::Resized>())
                {
                    updCamera(*pImg);
                }
            }

            ///----------------------|
            /// Update.              |
            ///----------------------:
            if( (fast || elapsedTimeMixer > timeMixer) && done )
            {   pImg->mixer       (10.f);
                elapsedTimeMixer = 0.0f ;
            }

            const auto delta  = clock.restart();
            elapsedTimeMixer += delta.asSeconds();

            ///----------------------|
            /// ImGui::SFML.         |
            ///----------------------:
            ImGui::SFML::Update(window, delta);
            ui.show();

            window.clear   ({0, 30, 60});

            ///----------------------|
            /// cam_world.           |
            ///----------------------:
            window.setView(camWorld);
            window.draw   (*pImg   );

            ///----------------------|
            /// cam_ui.              |
            ///----------------------:
            window.setView   (camUI);
        /// window.draw(text);

            ImGui::SFML::Render(window);
            window.display ();
        }
    }

    ///------------------------------------|
    /// DrawImage без кеширования.         |
    ///------------------------------------:
    DrawImage* getDrawImage(std::unique_ptr<DrawImage>& ptr)
    {          ptr = std::make_unique<DrawImage>(manegerCutterImage.getNext());
        return ptr.get();
    }

    void updCamera(const DrawImage& gi)
    {   const float&  SZX = gi.getSize().x;
        const float&  SZY = gi.getSize().y;
        const float   KG  = SZX / SZY;

        const unsigned& W = window.getSize().x;
        const unsigned& H = window.getSize().y;
        const float    KW = (float)W / H;

        KG > KW ? camWorld.setSize({ SZX        , SZX * H / W }) :
                  camWorld.setSize({ SZY * W / H, SZY         }) ;
    }

    ///------------------------------------|
    /// Инициализация гуя.                 |
    ///------------------------------------:
    void uiAllBind()
    {
        ui.add({"MousePosition", &MousePosition});

        ui.foo = [this](){ l("ui.foo"); };

        ui.pushCallback( {"zoom+", [this](){ fooZoomP(); }} );
        ui.pushCallback( {"zoom-", [this](){ fooZoomN(); }} );
        ui.pushCallback( {"Next" , [this](){ fooKeyN (); }} );
        ui.pushCallback( {"Build", [this](){ fooKey0 (); }} );
        ui.pushCallback( {"mixer", [this](){ fooKey1 (); }} );
        ui.pushCallback( {"fast" , [this](){ fooKeyF (); }} );
        ui.pushCallback( {"test" , [this](){ fooKey2 (); }} );
        ui.pushCallback( {"Task" , [this](){ fooKey3 (); }} );
    }

    ///------------------------------------|
    /// Методы User's управления.          |
    ///------------------------------------:
    void fooZoomP(){ camWorld.zoom(0.95f); }
    void fooZoomN(){ camWorld.zoom(1.05f); }
    void fooKeyN ()
    {   pImg = getDrawImage(ptrDrawImage);
        pImg->mixer(20.f);
        updCamera(*pImg);
    /// ui << uii::Clear{} << Task384   ::info(*pImg);
        ui << uii::Clear{} << Task384Mix::info(*pImg);
    }

    void fooKey0 ()
    {   pImg->set2Start(3);
        done = false;
        ui  << uii::Clear{} << Task384Mix::info(*pImg);
    }

    void fooKeyF (){ fast = !fast; }
    void fooKey1 (){ done = !done; }
    void fooKey2 ()
    {              pImg = ptrDrawImage.get();
                   pImg->mixer(20.f);
        updCamera(*pImg);
    /// ui << uii::Clear{} << task384    .info(*pImg);
        ui << uii::Clear{} << Task384Mix::info(*pImg);
    }

    void fooKey3 ()
    {              pImg = &drawLoadImages;
        updCamera(*pImg);
        ui << uii::Clear{} << task384.info(*pImg);
    }

    void test_01()
    {
        //ImGuiPlatformIO& platformIO = ImGui::GetPlatformIO();
        //ImGuiViewport* viewport = ImGui::GetMainViewport();

        l("test_01()")
    }
};


void tests()
{
    ///---------------------------|
    /// Тузлы.                    |
    ///---------------------------:
    if(bool on = true; on)
    {
    /// tools::GeneratorImages   ::test();
    /// tools::CutterImage       ::test();
    /// tools::ManegerCutterImage::test();
    }

/// myl ::testfoo_getVSizeWH();
/// CastomFilesCargo  ::test();
/// HeroTest          ::test();
/// TaskImage         ::test();
/// TaskImage  ::test_4Sides();
/// LoaderImages      ::test();
/// DrawImage         ::test();
/// Task384           ::test();
/// NanoTest          ::test();

    ///---------------------------|
    /// Основной рендер.          |
    ///---------------------------:
///
std::unique_ptr<Render> run(new Render);
}


///----------------------------------------------------------------------------|
/// Start.
///----------------------------------------------------------------------------:
int main ()
{
    [[maybe_unused]] int a{};

    std::cout << "START ...\n\n";
    TRY(tests())
    std::cout << "\nFINISHED PROGRAMM!\n";
}
