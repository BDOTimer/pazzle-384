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

        inline static sf::Color COLORCLICK{255, 128, 128};
        inline static sf::Color COLORCLEAR{255, 255, 255};

        void setPosition(const sf::Vector2f mousepos)
        {   for(auto& line : lines)
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
        float thickness{3};

        void init(const myl::Sprite* sp)
        {
            const sf::FloatRect& r = sp->getGlobalBounds();

            const float& T = thickness;

            lines[0].setSize({r.size.x,     T});
            lines[1].setSize({r.size.x,     T});
            lines[2].setSize({T, r.size.y    });
            lines[3].setSize({T, r.size.y + T});

            const float& x = r.position.x;
            const float& y = r.position.y;

            lines[0].setPosition({ x,             y           });
            lines[1].setPosition({ x,             y + r.size.y});
            lines[2].setPosition({ x           ,  y           });
            lines[3].setPosition({ x + r.size.x,  y           });
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

        myl::Sprite* psp{nullptr};
    };
};

namespace anm = animate;

#endif // ANIM_SPRITE_H
