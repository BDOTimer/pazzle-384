#ifndef GENIMG_H
#define GENIMG_H
/// "gen-img.h"
///-----------------------------------------------------------------------------
/// Генератор простых картинок(для настройки глаза Саурона).
///----------------------------------------------------------------------------:
#include <cmath>
#include <SFML/Graphics.hpp>

#include "debug.h"

namespace tools
{
    ///------------------------------------------------------------------------|
    /// GenData.
    ///---------------------------------------------------------------- GenData:
    struct GenData
    {
        sf::Color  colorA;
        sf::Color  colorB; /// Not used ...

        sf::Vector2u Size{123, 47};
    };


    ///------------------------------------------------------------------------|
    /// ConfigGI.
    ///--------------------------------------------------------------- ConfigGI:
    struct ConfigGI
    {
        std::vector<GenData> data
        {
            {   { 255, 255, 255 },
                {   0, 255,   0 }
            },
            {   {   0,   0,   0 },
                { 255, 255, 255 }
            },
            {   { 255,   0,   0 },
                {   0, 255,   0 }
            },
            {   { 255, 255, 255 },
                {   0, 255,   0 }
            }
        };

        std::string dir{"./genTest/"};

        static     const ConfigGI& get()
        {   static const ConfigGI  cfg;
            return                 cfg;
        }
    };


    ///------------------------------------------------------------------------|
    /// GeneratorImages.
    ///-------------------------------------------------------- GeneratorImages:
    struct  GeneratorImages : std::vector<sf::Image>
    {       GeneratorImages(const ConfigGI& _cfg) : cfg(_cfg)
            {   gen();
                countSave = save2file();
            }

        unsigned countSave{};

    private:
        const ConfigGI& cfg;
        void  gen()
        {
            reserve(cfg.data.size());

            for(const auto& data : cfg.data)
            {   emplace_back (sf::Image());
                back().create(data.Size.x, data.Size.y, data.colorA);
            }
        }

        unsigned save2file() const
        {   unsigned   cnt{};
            for(const auto& image : *this)
            {  if(!image.saveToFile(getName(++cnt))) return --cnt;
            }
            return cnt;
        }

        std::string getName(const unsigned n) const
        {                    std::string     a{std::to_string(n)};
            return cfg.dir + std::string(4 - a.size(), '0') + a + ".png";
        }

        TEST
        {   GeneratorImages generatorImages(ConfigGI::get());

            std::cout << "generatorImаges сохранил на диске: "
                      <<  generatorImages.countSave << " png-файлов.\a\n\n"
                      << std::endl;
        }
    };
}

#endif // GENIMG_H
