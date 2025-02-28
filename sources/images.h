#ifndef IMAGES_H
#define IMAGES_H
/// "images.h"
///-----------------------------------------------------------------------------
/// Загрузка текстуры в память.
///----------------------------------------------------------------------------:
#include "files-cargo.h"
#include "cutter-img.h"
#include "task-img.h"


///-----------------------------------------------------------------------------
/// Класс-загрузчик всех выбранных картинок на диске в контексте sf::Image.
///--------------------------------------------------------------- LoaderImages:
struct  LoaderImages : std::vector<TaskImage>
{       LoaderImages()
        {
            FilesCargo filesCargo;
            reserve   (filesCargo.get(".png").size());

            for(const auto&  filename : filesCargo.get(".png"))
            {   emplace_back (TaskImage(filename.string()));
            }
        }

private:
    std::vector<sf::Texture>& getTextures()
    {   static std::vector<sf::Texture> tt = TaskImage::img2Txtr(*this);
        return tt;
    }

    friend struct DrawImage;
    ///--------------------------------------|
    /// Тест разраба.                        |
    ///--------------------------------------:
    TEST
    {   LoaderImages loaderImages;
                   l(loaderImages.size())
                   l(loaderImages[0].debug());
                   l(loaderImages[1].debug());
                   l(loaderImages[2].debug());
    }
};


///-----------------------------------------------------------------------------
/// Класс готовит массив sf::Image для визуализации.
///------------------------------------------------------------------ DrawImage:
struct  DrawImage : sf::Drawable
{       DrawImage(LoaderImages& _images)
            :     images      ( _images),
                  textures    (&_images.getTextures())
        {
            init(myl::getVSizeWH(images.size()).front());

            l(myl::getVSizeWH(images.size()).front())
            l(myl::getN4Size (myl::getVSizeWH(images.size()).front()))
        }
        DrawImage(tools::CutterImage& _images)
            :     images            ( _images),
                  textures          (&_images.getTextures())
        {
            init(myl::getVSizeWH(images.size()).front());
        }

private:
    std::vector<TaskImage>&     images;
    std::vector<sf::Texture>* textures;
    std::vector<sf::Sprite>         sp;

    ///--------------------------------------|
    /// Расстановка спрайтов на экране.      |
    ///--------------------------------------:
    void init(const sf::Vector2u sz)
    {
        if(images.empty()) return;

        const std::vector<sf::Texture>& tt = *textures;//images.getTextures();

        sp.reserve(tt.size());

        const unsigned& SIDEx  = images.front().getSize().x;
        const unsigned& SIDEy  = images.front().getSize().y;
        const unsigned  SIDE2x = SIDEx / 2;
        const unsigned  SIDE2y = SIDEy / 2;

        const sf::Vector2u sza{sz.x * SIDEx / 2 - SIDE2x,
                               sz.y * SIDEy / 2 - SIDE2y};

        for    (unsigned y = 0; y < sz.y; ++y)
        {   for(unsigned x = 0; x < sz.x; ++x)
            {
                sp.emplace_back(sf::Sprite());
                sp.back().setOrigin  (SIDE2x, SIDE2y);
                sp.back().setTexture (  tt[sz.x  * y + x]);
                sp.back().setPosition(  float(x) * SIDEx - sza.x,
                                        float(y) * SIDEy - sza.y);
            }
        }
    }

    ///--------------------------------------|
    /// На рендер.                           |
    ///--------------------------------------:
    virtual void draw(sf::RenderTarget& target,
                      sf::RenderStates  states) const
    {
        for(const auto& sprite : sp) target.draw(sprite);
    }

    ///--------------------------------------|
    /// Тест разраба.                        |
    ///--------------------------------------:
    TEST
    {   LoaderImages        loaderImages ;
        DrawImage drawImage(loaderImages);
        SHOW(drawImage);
    }
};

#endif // IMAGES_H
