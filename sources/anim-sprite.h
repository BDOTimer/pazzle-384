#ifndef ANIM_SPRITE_H
#define ANIM_SPRITE_H
/// "anim-sprite.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include "myl.h"

namespace animate
{
    ///------------------------------------------------------------------------|
    /// Border
    ///----------------------------------------------------------------- Border:
    struct  Border : sf::Drawable
    {       Border()
            {   setColor();
            }


        void setPosition(const sf::Vector2f mousepos)
        {
            for(auto& line : lines)
            {         line.setPosition(mousepos);
            }
        }

        void bind(const myl::Sprite* sp)
        {    ASSERT(sp != nullptr)
             init  (sp);
        }

        void setColor(const sf::Color color = {255, 64, 128})
        {   for(auto& line : lines)
            {         line.setFillColor(color);
            }
        }

    private:
        std::array<sf::RectangleShape, 4> lines;

        void init(const myl::Sprite* sp)
        {
            const sf::FloatRect& r = sp->getGlobalBounds();

            lines[0].setSize({r.size.x, 3});
            lines[1].setSize({r.size.x, 3});
            lines[2].setSize({3, r.size.y});
            lines[3].setSize({3, r.size.y});

            for(auto& line : lines)
            {         //line.setOrigin ({line.getSize().x / 2,
                      //                 line.getSize().y / 2});
            }

            const float& x = r.position.x;
            const float& y = r.position.y;

/// TODO::1
/*
            lines[0].setPosition({ x,  r.size.y / 2 + y});
            lines[1].setPosition({ x, -r.size.y / 2 + y});
            lines[2].setPosition({ r.size.x / 2 + x,  y});
            lines[3].setPosition({-r.size.x / 2 + x,  y});
*/
            lines[0].setPosition({ x,  y});
            lines[1].setPosition({ x,  y});
            lines[2].setPosition({ x,  y});
            lines[3].setPosition({ x,  y});
        }


        ///--------------------------------------|
        /// На рендер.                           |
        ///--------------------------------------:
        virtual void draw(sf::RenderTarget& target,
                          sf::RenderStates  states) const
        {
            for(const auto& line : lines)
            {   target.draw(line);
            }
        }
    };


    ///------------------------------------------------------------------------|
    /// AnimSprite
    ///------------------------------------------------------------- AnimSprite:
    struct  AnimSprite : Border
    {       AnimSprite()
            {
            }

        void update()
        {

        }

    private:
        myl::Sprite* psp{nullptr};
    };
};

namespace anm = animate;

#endif // ANIM_SPRITE_H
