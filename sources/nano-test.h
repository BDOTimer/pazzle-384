#ifndef NANOTEST_H
#define NANOTEST_H
/// "nano-test.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include "debug.h"

namespace myl2
{
    ///--------------------------------------|
    /// Карманный рендер, чтобы увидеть obj. |
    ///--------------------------------------:
    #undef  SHOW
    #define SHOW(a) myl2::show(a, #a)

    template<class T> void show(const T& obj, std::string_view _titul)
    {   std::string titul = std::format("myl::show({})", _titul);
        sf::RenderWindow window(sf::VideoMode({800, 600}), titul);
                         window.setFramerateLimit  (50);

        sf::View camW  = window.getView();
                 camW.setCenter({0,0});
                 window.setView(camW);

        while (window.isOpen())
        {
            while (const std::optional event = window.pollEvent() )
            {   if(event->is<sf::Event::Closed>()) window.close();

            }
            window.clear  ();
            window.draw(obj);
            window.display();
        }
    }
}

///----------------------------------------------------------------------------|
/// ...
///--------------------------------------------------------------------- Config:
struct  NanoTest
{       NanoTest()
        {
        }

    static void test()
    {
        sf::Texture t;
                if(!t.loadFromFile("C:\\!CB-2025\\Projects\\CForum\\house.png",
                                   false, sf::IntRect({ 10, 10 }, { 32, 32 })))
                {
                }

        sf::RectangleShape shape;
                           shape.setTexture(&t);
                           shape.setSize({150,150});
        SHOW(shape);
    }
};

#endif // NANOTEST_H
