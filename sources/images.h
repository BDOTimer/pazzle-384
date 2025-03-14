#ifndef IMAGES_H
#define IMAGES_H
/// "images.h"
///----------------------------------------------------------------------------|
/// Загрузка текстуры в память.
///----------------------------------------------------------------------------:
#include "files-cargo.h"
#include "cutter-img.h"
#include "task-img.h"


///----------------------------------------------------------------------------|
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
    std::vector<sf::Texture> getTextures()
    {   return TaskImage::img2Txtr(*this);
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


///----------------------------------------------------------------------------|
/// Класс готовит массив sf::Image для визуализации.
///------------------------------------------------------------------ DrawImage:
struct  DrawImage : sf::Drawable
{       DrawImage(LoaderImages& _images )
            :     images      ( _images )
        {
            WH = myl::getVSizeWH(images.size()).front();
            init              ();
            arrangeSprites(30.f);

            ASSERT(!images.empty())

            sz = { WH.x * images.front().getSize().x ,
                   WH.y * images.front().getSize().y };

            l(myl::getN4Size (myl::getVSizeWH(images.size()).front())) /////////
        }
        DrawImage(tools::CutterImage& _images )
            :     images            ( _images )
        {
            WH = myl::getVSizeWH(images.size()).front();
            init              ();
            arrangeSprites(30.f);

            ASSERT(!images.empty())

            sz = _images.getSizeImgSource();
        }

    sf::Vector2u getSize() const
    {   return SZ;
    }

    const sf::Vector2u& getSizeImgSource() const { return sz; }

    void mixer(float gap = 0.f)
    {
        for(unsigned n = 0; n < spp.size(); ++n)
        {
            unsigned a = unsigned(rand() % spp.size());
            unsigned b = unsigned(rand() % spp.size());

            if(a != b) std::swap(spp[a], spp[b]);
        }
        arrangeSprites(gap);
    }

    void set2Start(float gap = 0.f)
    {   for(unsigned i = 0; i < sp.size(); ++i) spp[i] = &sp[i];
        arrangeSprites(gap);
    }

private:
    sf::Vector2u                   WH; /// Размер в разрезанных images.
    sf::Vector2u                   sz; /// Размер base image в пикселях.
    sf::Vector2u                   SZ; /// Размер base image в пикселях + gap.
    std::vector<TaskImage>&    images;
    std::vector<sf::Texture> textures;
    std::vector<myl::Sprite>       sp;
    std::vector<myl::Sprite*>     spp;

    void calcSize  (float gap)
    {   SZ   = images.front().getSize();
        SZ.x = SZ.x * WH.x + (WH.x - 1) * gap;
        SZ.y = SZ.y * WH.y + (WH.y - 1) * gap;
    }

    ///--------------------------------------|
    /// Расстановка спрайтов на экране.      |
    ///--------------------------------------:
    void arrangeSprites(float gap = 0.0f)
    {
        calcSize(gap);

        const unsigned& SIDEx  = images.front().getSize().x + gap;
        const unsigned& SIDEy  = images.front().getSize().y + gap;
        const unsigned  SIDE2x = SIDEx / 2;
        const unsigned  SIDE2y = SIDEy / 2;

        const sf::Vector2u sza{WH.x * SIDEx / 2 - SIDE2x,
                               WH.y * SIDEy / 2 - SIDE2y};

        for    (unsigned y = 0; y < WH.y; ++y)
        {   for(unsigned x = 0; x < WH.x; ++x)
            {
                spp[WH.x  * y + x]->setPosition({float(x) * SIDEx - sza.x,
                                                 float(y) * SIDEy - sza.y});
            }
        }
    }

    void init()
    {
        if(images  .empty()) return;
        if(textures.empty())
        {
            textures = TaskImage::img2Txtr(images);

            const unsigned WxH = WH.y * WH.x;

            sp.reserve(WxH);
            spp.resize(WxH);

            for(unsigned i = 0; i < spp.size(); ++i)
            {
                sp.emplace_back(myl::Sprite(textures[i]));
                sp.back().setOrigin ({(float)images.front().getSize().x / 2,
                                      (float)images.front().getSize().y / 2});

                spp[i] = &sp.back();

                sp.back().id       = i;
                sp.back().filename = images[i].filename;
            }
        }
    }

    ///--------------------------------------|
    /// На рендер.                           |
    ///--------------------------------------:
    virtual void draw(sf::RenderTarget& target,
                      sf::RenderStates  states) const
    {
        for(const auto& psprite : spp) target.draw(*psprite);
    }

    ///--------------------------------------|
    /// Тест разраба.                        |
    ///--------------------------------------:
    TEST
    {   LoaderImages        loaderImages ;
        DrawImage drawImage(loaderImages);
        SHOW(drawImage);
    }

    friend struct Task384;
    friend struct Task384Mix;
};

#endif // IMAGES_H
