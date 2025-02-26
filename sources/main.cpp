#define SFML_STATIC
///----------------------------------------------------------------------------|
/// ...
/// отключить консольное окно: -mwindows
///----------------------------------------------------------------------------:

#include "files-cargo.h"
#include "images.h"
#include "task384.h"
#include "gen-img.h"

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
{       Render() :  window(sf::VideoMode(1200, 800), Config::get().VERSION),
                    drawTexture(images),
                    task384    (images)
        {
            window.setFramerateLimit  (50);

            camUI = window.getView();

            const int W = 1200;

            camWorld = camUI;
            camWorld.setCenter({0,0});
            camWorld.setSize(W, W * 800 / 1200);
            camWorld.zoom(0.7f);

            font.loadFromFile   ("c:/windows/fonts/consola.ttf"); ///<-------!!!

            text.setFont                (font);
            text.setCharacterSize         (18);
            text.setStyle  (sf::Text::Regular);
            text.setFillColor(sf::Color::Yellow);

            loop();
        }

    sf::RenderWindow window;
    HeroTest           hero;
    sf::Font           font;
    sf::Text           text;

    ///--------------------|
    /// Камеры вида.       |
    ///--------------------:
    sf::View          camUI;
    sf::View       camWorld;

    LoaderImages     images;
    DrawImage   drawTexture;
    Task384         task384;

    void process_mouse(const sf::Vector2i& mouse_pos)
    {   std::string    s("XY = [");
                       s += std::to_string(mouse_pos.x) + ", ";
                       s += std::to_string(mouse_pos.y) + "]" ;
        text.setString(s);
    }

    void loop()
    {
        sf::Vector2i mouse_pos;

        while (window.isOpen())
        {
            for (sf::Event event; window.pollEvent(event);)
            {
                if (event.type == sf::Event::Closed) window.close();

                ///------------------------------------|
                /// MouseMoved только здесь.           |
                ///------------------------------------:
                if (event.type == sf::Event::MouseMoved)
                {   mouse_pos  =  sf::Mouse::getPosition(window);
                    process_mouse(mouse_pos);
                }
            }

            window.clear   ({0, 20, 40});

            ///----------------------|
            /// cam_world.           |
            ///----------------------:
            window.setView(camWorld);
            window.draw(drawTexture);

            ///----------------------|
            /// cam_ui.              |
            ///----------------------:
            window.setView   (camUI);
            window.draw(text);

            window.display ();
        }
    }
};


void tests()
{
    ///---------------------------|
    /// Тузлы.                    |
    ///---------------------------:
    if(bool on = false; on)
    {   tools::GeneratorImages::test();
    }

/// myl::testfoo_getVSizeWH();
/// CastomFilesCargo ::test();
/// HeroTest         ::test();
/// TaskImage        ::test();
/// TaskImage ::test_4Sides();
/// LoaderImages     ::test();
/// DrawImage        ::test();
/// Task384          ::test();

    ///---------------------------|
    /// Основной рендер.          |
    ///---------------------------:
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
