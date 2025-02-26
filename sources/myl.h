#ifndef MYL_H
#define MYL_H
/// "myl.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include "debug.h"
#include "config.h"

template<typename T>
inline std::ostream& operator<<(std::ostream& o, const sf::Vector2<T> e)
{   o << std::format("    WH: [{}, {}]\n", e.x, e.y);
    return o;
}

template<typename T>
inline std::ostream& operator<<(std::ostream& o, const std::vector<T>& m)
{   for(const auto& e : m) o << e;
    return o;
}

namespace myl
{
    ///--------------------------------------|
    /// Карманный рендер, чтобы увидеть obj. |
    ///--------------------------------------:
    #define SHOW(a) myl::show(a, #a)

    template<class T> void show(const T& obj, std::string_view _titul)
    {   std::string titul = std::format("myl::show({})", _titul);
        sf::RenderWindow window(sf::VideoMode(800, 600), titul);
                         window.setFramerateLimit  (50);

        sf::View camW  = window.getView();
                 camW.setCenter({0,0});
                 window.setView(camW);

        while (window.isOpen())
        {
            for (sf::Event event; window.pollEvent(event); )
            {   if (event.type == sf::Event::Closed) window.close();
            }
            window.clear  ();
            window.draw(obj);
            window.display();
        }
    }

    ///--------------------------------------|
    /// Получить массив делителей для N.     |
    ///--------------------------------------:
    inline std::vector<sf::Vector2u> getVSizeWH(const unsigned N)
    {      std::vector<sf::Vector2u> m;

        for(unsigned a = unsigned(std::sqrt(N)); a != 0; --a)
        {   if(unsigned  b = N %  a; b == 0)
            {   m.push_back({N /  a, a});
                if( m.back().x != a)
                {   m.push_back( {a, m.back().x});
                }
            }
        }
        return m;
    }

    ///--------------------------------------|
    /// Получить кол-во соединений для W x H.|
    ///--------------------------------------:
    inline unsigned getN4Size(const sf::Vector2u WH)
    {   return (WH.x - 1) * WH.y + (WH.y - 1) * WH.x;
    }

    inline void testfoo_getVSizeWH(){ ln(getVSizeWH(384)) }
}

#endif // MYL_H
