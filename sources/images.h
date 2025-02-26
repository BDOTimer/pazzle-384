#ifndef IMAGES_H
#define IMAGES_H
/// "images.h"
///-----------------------------------------------------------------------------
/// Загрузка текстуры в память.
///----------------------------------------------------------------------------:
#include <cmath>
#include <iomanip>

#include <SFML/Graphics.hpp>
#include "files-cargo.h"

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

    void testfoo_getVSizeWH(){ ln(getVSizeWH(384)) }
}


///-----------------------------------------------------------------------------
/// Класс-расширение для sf::Image.
///-------------------------------------------------------------------- myImage:
struct  myImage : sf::Image
{       myImage(std::string_view _filename) : filename(_filename)
        {   loadFromFile(filename);
        }

    std::string filename;

    virtual myImage* getThis() { return this; }

    ///----------------------------------|
    /// Что уже есть в составе:          |
    /// см. доку на www.sfml-dev.org     |
    ///----------------------------------:
    /// Например,
    sf::Vector2u getSize() const { return sf::Image::getSize(); };

    std::string debug() const
    {   return std::format(
            "    filename: \"{}\", Size: [{}, {}]",
            filename,
            getSize().x,
            getSize().y
        );
    }
};

using Mat2dPixel = Mat2d<sf::Color>;

///-----------------------------------------------------------------------------
/// Прототип класса для задачи.
///------------------------------------------------------------------ TaskImage:
struct  TaskImage : myImage
{       TaskImage(std::string_view filename) : myImage(filename)
        {   init_4Sides(_4Sides, *this);
        }

    enum eSIDES
    {    UP   ,
         DOWN ,
         RIGHT,
         LEFT ,
         NONE
    };

    static std::string_view whatSIDE(const eSIDES e)
    {   static const char* m[]
        {   "UP   ",
            "DOWN ",
            "RIGHT",
            "LEFT ",
            "NONE "
        };
        return m[e];
    }

    const Mat2dPixel& get(eSIDES Side) const { return _4Sides[Side]; }

private:
    ///--------------------------------------|
    /// 4 дампа с пикселями.                 |
    ///--------------------------------------:
    std::array<Mat2dPixel, 4>         _4Sides;

    inline static unsigned           width{2};

    ///--------------------------------------|
    /// Берём пиксели с пазла и укладываем.  |
    ///--------------------------------------:
    static void init_4Sides(std::array<Mat2dPixel, 4>& _4S,
                            const sf::Image&           img)
    {
        const sf::Vector2u SZ = img.getSize();

        ///---------------|
        /// eSIDES::UP    |
        ///---------------:
        {
            Mat2dPixel& mat = _4S[eSIDES::UP]; mat.reserve(width);

            for    (unsigned y = 0; y < width; ++y)
            {
                mat.emplace_back(std::vector<sf::Color>());
                mat.back().reserve(SZ.x);

                for(unsigned x = 0; x < SZ.x ; ++x)
                {   mat.back().emplace_back(img.getPixel(x, y));
                }
            }
        }

        ///---------------|
        /// eSIDES::RIGHT |
        ///---------------:
        {
            Mat2dPixel& mat = _4S[eSIDES::RIGHT]; mat.reserve(width);

            for(unsigned x = SZ.x - 1, i = 0; i < width; --x, ++i)
            {
                mat.emplace_back(std::vector<sf::Color>());
                mat.back().reserve(SZ.y);

                for(unsigned y = 0; y < SZ.y ; ++y)
                {   mat.back().emplace_back(img.getPixel(x, y));
                }
            }
        }

        ///---------------|
        /// eSIDES::DOWN  |
        ///---------------:
        {
            Mat2dPixel& mat = _4S[eSIDES::DOWN]; mat.reserve(width);

            for(unsigned y = SZ.y - 1, i = 0; i < width; --y, ++i)
            {
                mat.emplace_back(std::vector<sf::Color>());
                mat.back().reserve(SZ.x);

                for(unsigned x = 0; x < SZ.x ; ++x)
                {   mat.back().emplace_back(img.getPixel(x, y));
                }
            }
        }

        ///---------------|
        /// eSIDES::LEFT  |
        ///---------------:
        {
            Mat2dPixel& mat = _4S[eSIDES::LEFT]; mat.reserve(width);

            for(unsigned x = 0; x < width; ++x)
            {
                mat.emplace_back(std::vector<sf::Color>());
                mat.back().reserve(SZ.y);

                for(unsigned y = 0; y < SZ.y ; ++y)
                {   mat.back().emplace_back(img.getPixel(x, y));
                }
            }
        }
    }

    static void test_4Sides()
    {   std::cout << "Start::test_4Sides():\n";

        sf::Image img;
                  img.create(5, 8);

        ln(img.getSize())

        ///--------------------------------------|
        /// Заполняем красный в img змейкой.     |
        ///--------------------------------------:
        {
            unsigned char red = 0;
            for(unsigned  x = 0; x < img.getSize().x; ++x)
            {   img.setPixel(x, 0, {red++, 0, 0});
            }

            for(unsigned  y = 1; y < img.getSize().y; ++y)
            {   img.setPixel(img.getSize().x - 1, y, {red++, 0, 0});
            }

            for(unsigned  x = img.getSize().x - 2; x < img.getSize().x; --x)
            {   img.setPixel(x, img.getSize().y - 1, {red++, 0, 0});
            }

            for(unsigned  y = img.getSize().y - 2; y != 0; --y)
            {   img.setPixel( 0, y, {red++, 0, 0});
            }
        }

        ///--------------------------------------|
        /// Буфер для пикселей:                  |
        /// 4 матрицы толщиной width.            |
        ///--------------------------------------:
        std::array<Mat2dPixel, 4> _4STest;

        ///--------------------------------------|
        /// Кролик тестирования.                 |
        ///--------------------------------------:
        init_4Sides             ( _4STest, img );

        unsigned E{eSIDES::UP };

        ///--------------------------------------|
        /// Ручная, т.е. глазная верификация.    |
        ///--------------------------------------:
        /// Содержимое img.                      |
        ///--------------------------------------:
        for    (unsigned y = 0; y < img.getSize().y; ++y)
        {       std::cout << "  ";
            for(unsigned x = 0; x < img.getSize().x; ++x)
            {   std::cout << std::setw(3) << (int)img.getPixel(x, y).r;
            }   std::cout << '\n';
        }       std::cout << '\n';

        l(width)

        ///--------------------------------------|
        /// Содержимое буферов по сторонам img.  |
        ///--------------------------------------:
        for        (const auto& mat   : _4STest)
        {   std::cout << whatSIDE(eSIDES(E++)) << ":\n";
            for    (const auto& line  : mat    )
            {       std::cout << "  ";
                for(const auto& pixel : line   )
                {   std::cout << std::setw(3) << (int)pixel.r;
                }   std::cout << '\n';
            }       std::cout << '\n';
        }           std::cout << '\n';

        std::cout << "Finished::test_4Sides():\n";
    }

    ///--------------------------------------|
    /// Тест разраба.                        |
    ///--------------------------------------:
    TEST
    {   FilesCargo     filesCargo;
        TaskImage task(filesCargo.get(".png").front().string());
               ln(task.debug());

        test_4Sides();
    }
};


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
    {   static std::vector<sf::Texture> tt;
        if(!tt.empty())         return  tt;

        tt.reserve(size());

        for(const auto& image : *this)
        {   tt.emplace_back(sf::Texture());
            tt.back().loadFromImage(image);
        }
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
{       DrawImage(LoaderImages& _images) : images(_images)
        {   init(myl::getVSizeWH(images.size()).front());
        }

private:
    LoaderImages&       images;
    std::vector<sf::Sprite> sp;

    ///--------------------------------------|
    /// Расстановка спрайтов на экране.      |
    ///--------------------------------------:
    void init(const sf::Vector2u sz)
    {
        if(images.empty()) return;

        const std::vector<sf::Texture>& tt = images.getTextures();

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
