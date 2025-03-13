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
                 ,  ui         (window)
                 ,  text       (font  )
                 ,  drawTexture(images)
                 ,  task384    (images)
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

    ///--------------------|
    /// Главное Окно.      |
    ///--------------------:
    sf::RenderWindow window;

    ///--------------------|
    /// Gui.               |
    ///--------------------:
    uii::UITest          ui;

    sf::Font           font;
    sf::Text           text;
    HeroTest           hero;

    ///--------------------|
    /// Камеры вида.       |
    ///--------------------:
    sf::View          camUI;
    sf::View       camWorld;

    LoaderImages     images;
    DrawImage   drawTexture;
    Task384         task384;

    ///-----------------------------------------|
    /// Буфер для всех ТЕСТОВЫХ img.            |
    ///-----------------------------------------:
    tools::ManegerCutterImage manegerCutterImage;

    sf::Clock clock;

    std::string MousePosition;
    void process_mouse(const sf::Vector2i& mouse_pos)
    {   std::string    s("XY = [");
                       s += std::to_string(mouse_pos.x) + ", ";
                       s += std::to_string(mouse_pos.y) + "]" ;
        //text.setString(s);
        std::swap(s, MousePosition);
    }

    void loop()
    {
        ui << uii::Clear{} << task384.info(100);

        float        timeMixer = 0.1f;
        float elapsedTimeMixer = 0.0f;
        bool  done = false;
        bool  fast = false;

        sf::Vector2i        mouse_pos;

        std::unique_ptr<DrawImage> ptrDrawImage
            = std::make_unique<DrawImage>(manegerCutterImage.getNext());

        DrawImage* pImg = &drawTexture;

        updCamera(*pImg);

        while (window.isOpen())
        {
            while (const std::optional event = window.pollEvent() )
            {
                ImGui::SFML::ProcessEvent(window, *event);

                using E = sf::Event;

                if(event->is<sf::Event::Closed>()) window.close();

                if(ImGui::IsAnyItemActive()) break;
            /// if(ImGui::IsWindowFocused()) break;

                if (const auto* keyPressed = event->getIf<E::KeyPressed>())
                {
                    /// ...

                    switch(keyPressed->scancode)
                    {
                        case sf::Keyboard::Scancode::C:
                        {   pImg->mixer(20.f);
                            updCamera (*pImg);
                            break;
                        }
                        case sf::Keyboard::Scancode::F:
                        {   fast = !fast;
                            break;
                        }
                        case sf::Keyboard::Scancode::Num0:
                        {   pImg->set2Start(3);
                            done = false;
                            ui << uii::Clear{} << Task384Mix::info(*pImg);
                            break;
                        }
                        case sf::Keyboard::Scancode::Num1:
                        {   done = !done;
                            break;
                        }
                        case sf::Keyboard::Scancode::Num2:
                        {              pImg = ptrDrawImage.get();
                                       pImg->mixer(20.f);
                            updCamera(*pImg);
                            ui << uii::Clear{} << task384.info(*pImg);
                            break;
                        }
                        case sf::Keyboard::Scancode::Num3:
                        {              pImg = &drawTexture;
                            updCamera(*pImg);
                            ui << uii::Clear{} << task384.info(*pImg);
                            break;
                        }
                        case sf::Keyboard::Scancode::W:
                        {   camWorld.zoom(1.05f);
                            break;
                        }
                        case sf::Keyboard::Scancode::S:
                        {   camWorld.zoom(0.95f);
                            break;
                        }
                        case sf::Keyboard::Scancode::N:
                        {              pImg = getDrawImage(ptrDrawImage);
                                       pImg->mixer(20.f);
                            updCamera(*pImg);
                        /// ui << uii::Clear{} << Task384   ::info(*pImg);
                            ui << uii::Clear{} << Task384Mix::info(*pImg);
                            break;
                        }
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
            ui.go();

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
    {   const float& SZX =  gi.getSize().x;
        const float& SZY =  gi.getSize().y;
        if(SZX > SZY) camWorld.setSize({SZX, SZX * 800 / 1200});
        else          camWorld.setSize({SZY * 1200 / 800, SZY});
    }

    void uiAllBind()
    {
        ui.add({"MousePosition", &MousePosition});
    }

    void test_01()
    {
        //ImGuiPlatformIO& platformIO = ImGui::GetPlatformIO();
        //ImGuiViewport* viewport = ImGui::GetMainViewport();
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
