#ifndef NANOTEST_H
#define NANOTEST_H
/// "nano-test.h"
///----------------------------------------------------------------------------|
/// ...
///----------------------------------------------------------------------------:
#include "imgui.h"
#include "imgui-SFML.h"
#include "misc/cpp/imgui_stdlib.h"

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

        if(!ImGui::SFML::Init(window))
        {   /// ...
        }

        sf::Clock deltaClock;

        while (window.isOpen())
        {
            while (const std::optional event = window.pollEvent() )
            {
                ImGui::SFML::ProcessEvent(window, *event);

                if(event->is<sf::Event::Closed>()) window.close();

            }

            ImGui::SFML::Update(window, deltaClock.restart());

            ImGui::ShowDemoWindow();

            ImGui::Begin("Hello, world!");
            ImGui::Button("Look at this pretty button");
            ImGui::End();

            window.clear  ();
            window.draw(obj);

            ImGui::SFML::Render(window);
            window.display();
        }
        ImGui::SFML::Shutdown();
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
                if(!t.loadFromFile("img/img  _50.jpg"))
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
