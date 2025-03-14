#ifndef TASKIMG_H
#define TASKIMG_H
/// "task-img.h"
///----------------------------------------------------------------------------|
/// ...
///----------------------------------------------------------------------------:
#include "myl.h"

///----------------------------------------------------------------------------|
/// Класс-расширение для sf::Image.
///-------------------------------------------------------------------- myImage:
struct  myImage : sf::Image
{       myImage(std::string_view _filename) : filename(_filename)
        {   if(loadFromFile(filename))
            {
                /// TODO ...
            }
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

///----------------------------------------------------------------------------|
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

    ///--------------------------------------|
    /// Получаем текстуры из имиджей.        |
    ///--------------------------------------:
    static std::vector<sf::Texture> img2Txtr(const std::vector<TaskImage>& imgs)
    {
        std::vector<sf::Texture> tt; tt.reserve(imgs.size());

        for(const auto& img : imgs)
        {   tt.emplace_back(sf::Texture());
            if(!tt.back().loadFromImage(img))
            {   ASSERTM(false, "loadFromImage(.) is failed ...")
            }
        }
        return tt;
    }

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
                {   mat.back().emplace_back(img.getPixel({x, y}));
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
                {   mat.back().emplace_back(img.getPixel({x, y}));
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
                {   mat.back().emplace_back(img.getPixel({x, y}));
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
                {   mat.back().emplace_back(img.getPixel({x, y}));
                }
            }
        }
    }

    static void test_4Sides()
    {   std::cout << "Start::test_4Sides():\n";

        sf::Image img;
                  img.resize({5, 8});

        ln(img.getSize())

        ///--------------------------------------|
        /// Заполняем красный в img змейкой.     |
        ///--------------------------------------:
        {
            unsigned char red = 0;
            for(unsigned  x = 0; x < img.getSize().x; ++x)
            {   img.setPixel({x, 0}, {red++, 0, 0});
            }

            for(unsigned  y = 1; y < img.getSize().y; ++y)
            {   img.setPixel({img.getSize().x - 1, y}, {red++, 0, 0});
            }

            for(unsigned  x = img.getSize().x - 2; x < img.getSize().x; --x)
            {   img.setPixel({x, img.getSize().y - 1}, {red++, 0, 0});
            }

            for(unsigned  y = img.getSize().y - 2; y != 0; --y)
            {   img.setPixel( {0, y}, {red++, 0, 0});
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
            {   std::cout << std::setw(3) << (int)img.getPixel({x, y}).r;
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


#endif // TASKIMG_H
