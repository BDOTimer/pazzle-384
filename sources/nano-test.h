#ifndef NANOTEST_H
#define NANOTEST_H
/// "nano-test.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include <filesystem> /// C++17
#include <algorithm>
#include <iostream>
#include <iterator>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <memory>
#include <format>  /// C++20
#include <vector>
#include <string>
#include <cmath>
#include <list>
#include <map>
#include <set>

#include <SFML/Graphics.hpp>

namespace ntest
{
    ///--------------------------------------|
    /// Карманный рендер, чтобы увидеть obj. |
    ///--------------------------------------:
    #define RENDER(a) ntest::show(a, #a)

    template<class T> void show(const T& obj, std::string_view _titul)
    {   std::string titul = std::format("myl::show({})", _titul);
        sf::RenderWindow window(sf::VideoMode({800, 600}), titul);
                         window.setFramerateLimit  (50);

        sf::View camW  = window.getView();
                 camW.setCenter   ({0,0});
                 window.setView   (camW );

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
        RENDER(shape);
    }
};

#undef RENDER
#endif // NANOTEST_H
