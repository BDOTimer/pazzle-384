#ifndef IMAGES_H
#define IMAGES_H
/// "images.h"
///----------------------------------------------------------------------------|
/// Загрузка текстуры в память.
///----------------------------------------------------------------------------:
#include "anim-sprite.h"
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
        for(unsigned n = 0; n < psp.size(); ++n)
        {
            unsigned a = unsigned(rand() % psp.size());
            unsigned b = unsigned(rand() % psp.size());

            if(a != b) std::swap(psp[a], psp[b]);
        }
        arrangeSprites(gap);
    }

    void set2Start(float gap = 0.f)
    {   for(unsigned i = 0; i < sp.size(); ++i) psp[i] = &sp[i];
        arrangeSprites(gap);
    }

    void doMousePressed(const sf::Vector2f& click)
    {   if(const auto p  = searchSprite    (click);
                      p != nullptr)
        {
            if(animSprite.psp != nullptr)
            animSprite.psp->setColor(anm::AnimSprite::COLORCLEAR);
                       p  ->setColor(anm::AnimSprite::COLORCLICK);

            animSprite.psp = p;
            animSprite.bind (p);
        }
    }

    void doMouseReleased(const sf::Vector2i& click)
    {
    }

private:
    sf::Vector2u                   WH; /// Размер в разрезанных images.
    sf::Vector2u                   sz; /// Размер base image в пикселях.
    sf::Vector2u                   SZ; /// Размер base image в пикселях + gap.
    std::vector<TaskImage>&    images;
    std::vector<sf::Texture> textures;
    std::vector<myl::Sprite>       sp;
    std::vector<myl::Sprite*>     psp;

    anm::AnimSprite        animSprite;

    void calcSize (float gap)
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
                psp[WH.x  * y + x]->setPosition({float(x) * SIDEx - sza.x,
                                                 float(y) * SIDEy - sza.y});
            }
        }

        ///--------------------------------------|
        /// Захват спрайта.                      |
        ///--------------------------------------:
        animSprite.bind(psp[0]);
    }

    void init()
    {
        if(images  .empty()) return;
        if(textures.empty())
        {
            textures = TaskImage::img2Txtr(images);

            const unsigned WxH = WH.y * WH.x;

            sp.reserve(WxH);
            psp.resize(WxH);

            for(unsigned i = 0; i < psp.size(); ++i)
            {
                sp.emplace_back(myl::Sprite(textures[i]));
                sp.back().setOrigin ({(float)images.front().getSize().x / 2,
                                      (float)images.front().getSize().y / 2});

                psp[i] = &sp.back();

                sp.back().id       = i;
                sp.back().filename = images[i].filename;
            }
        }
    }

    myl::Sprite* searchSprite(const sf::Vector2f& click) const
    {   for(const auto p : psp)
        {   if(p->getGlobalBounds().contains(click)) return p;
        }
        return nullptr;
    }

    ///--------------------------------------|
    /// На рендер.                           |
    ///--------------------------------------:
    virtual void draw(sf::RenderTarget& target,
                      sf::RenderStates  states) const
    {
        for(const auto& psprite : psp) target.draw(*psprite);
        target.draw (animSprite);
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
