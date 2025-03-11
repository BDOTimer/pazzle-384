/// #define SFML_STATIC
///----------------------------------------------------------------------------|
/// ...
/// отключить консольное окно: -mwindows
///----------------------------------------------------------------------------:
#include "ui-imgui.h"
#include "files-cargo.h"
#include "images.h"
#include "task384.h"
#include "gen-img.h"
#include "cutter-img.h"
#include "nano-test.h"


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
                 ,  drawCutter (cutter)
        {
            window.setFramerateLimit(50);

            camUI = window.getView();

            const int W = 1200;

            camWorld = camUI;
            camWorld.setCenter({0,0});
            camWorld.setSize({W, W * 800 / 1200});
            camWorld.zoom(0.7f);

            if(!font.openFromFile("consola.ttf"))
            {   ASSERTM(false, "openFromFile(\"*.ttf\") is failed ...")
            }

            text.setFont                  (font);
            text.setCharacterSize           (18);
            text.setStyle    (sf::Text::Regular);
            text.setFillColor(sf::Color::Yellow);

            uiAllBind();

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

    tools::CutterImage cutter;
    DrawImage      drawCutter;

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
        ui << task384.info(100);

        float        timeMixer = 0.1f;
        float elapsedTimeMixer = 0.0f;
        bool done = false;
        bool fast = false;

        sf::Vector2i        mouse_pos;

        std::unique_ptr<DrawImage> ptrDrawImage;

        std::vector<DrawImage*> pVImg
        {   &drawTexture,
            &drawCutter,
            getDrawImage(ptrDrawImage)
        };
        DrawImage* pImg = pVImg[0];

        drawCutter.mixer();

        while (window.isOpen())
        {
            while (const std::optional event = window.pollEvent() )
            {
                ImGui::SFML::ProcessEvent(window, *event);

                using E = sf::Event;

                if(event->is<sf::Event::Closed>()) window.close();

                if (const auto* keyPressed = event->getIf<E::KeyPressed>())
                {
                    /// ...

                    switch(keyPressed->scancode)
                    {
                        case sf::Keyboard::Scancode::C:
                        {   pImg->mixer(20.f);
                            break;
                        }
                        case sf::Keyboard::Scancode::F:
                        {   fast = !fast;
                            break;
                        }
                        case sf::Keyboard::Scancode::Num0:
                        {   pImg->set2Start(3);
                            done = false;
                            break;
                        }
                        case sf::Keyboard::Scancode::Num1:
                        {   done = !done;
                            break;
                        }
                        case sf::Keyboard::Scancode::Enter:
                        {   static unsigned i = 0;
                            pImg = pVImg   [i = myl::geti(i, pVImg.size())];
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
                        {
                            pVImg[2] = getDrawImage(ptrDrawImage);
                            pImg     = pVImg[2];
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
            window.draw(text);

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

    void uiAllBind()
    {
        ui.add({"MousePosition", &MousePosition});
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
