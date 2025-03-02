﻿#ifndef CUTTERIMG_H
#define CUTTERIMG_H
/// "cutter-img.h"
///-----------------------------------------------------------------------------
/// Разрезать картинку на равные части.
///----------------------------------------------------------------------------:
#include "myl.h"
#include "task-img.h"

namespace tools
{

    ///------------------------------------------------------------------------|
    /// ConfigCutterImg.
    ///-------------------------------------------------------- ConfigCutterImg:
    struct  ConfigCutterImg
    {       ConfigCutterImg()
            {   load5File();
            }

        std::string  dir       {"./img/"};
        std::string  fileSource{"in.jpg"};
        std::string  fileDest  {"./img/cutting/"};

        sf::Vector2u WH        {3, 3};


    private:
        void load5File()
        {

        }

        ///--------------------------------------|
        /// Получить дефолтный конфиг.           |
        ///--------------------------------------:
        static     const ConfigCutterImg& get()
        {   static const ConfigCutterImg  cfg;
            return                        cfg;
        }

        friend struct CutterImage;
    };


    ///------------------------------------------------------------------------|
    /// CutterImage.
    ///------------------------------------------------------------- CutterImage:
    struct  CutterImage : std::vector<TaskImage>
    {       CutterImage(bool isNeedSave = false)
            {   std::string  filename {  ConfigCutterImg::get().dir};
                             filename += ConfigCutterImg::get().fileSource;

                if(!imgSource.loadFromFile(filename))
                {
                    /// TODO: ... failed ...
                    ASSERTM(false, "loadFromFile is failed ...")
                }
                save2Files          (isNeedSave);
            }

    std::vector<sf::Texture> getTextures()
    {   return TaskImage::img2Txtr (*this);
    }

    private:
        sf::Image imgSource;

        void save2Files(bool isNeedSave)
        {
            ///--------------------------------------|
            /// Количество фрагментов.               |
            ///--------------------------------------:
            const auto WxH = ConfigCutterImg::get().WH.x
                           * ConfigCutterImg::get().WH.y;

            ///--------------------------------------|
            /// Чтобы избежать аллокаций...          |
            ///--------------------------------------:
            reserve(WxH);

            ///--------------------------------------|
            /// Для входного имиджа.                 |
            ///--------------------------------------:
            const auto& WS = imgSource.getSize().x;
            const auto& HS = imgSource.getSize().y;

            ///--------------------------------------|
            /// Для каждого фрагмента.               |
            ///--------------------------------------:
            const sf::Vector2u sz
            {   WS / ConfigCutterImg::get().WH.x,
                HS / ConfigCutterImg::get().WH.y
            };

            unsigned cnt{1};

            ///--------------------------------------|
            /// Выборка фрагмента из входного имиджа.|
            ///--------------------------------------:
            for    (int h = 0, YS = int(HS); h < YS; h += sz.y)
            {   for(int w = 0, XS = int(WS); w < XS; w += sz.x)
                {
                    std::string fileDest { ConfigCutterImg::get().fileDest };
                                fileDest += std::to_string(cnt);
                                fileDest += ".png";

                    /// l(std::format("[{},{}]", w, h))

                    /*///
                    ///--------------------------------------|
                    /// Альтернативный способ.               |
                    ///--------------------------------------:
                    std::string fileDest2
                    {   std::format("{}{}{}", ConfigCutterImg::get().fileDest
                                            , std::to_string(cnt)
                                            ,  ".png")
                    };
                    //*///

                    ///--------------------------------------|
                    /// Область входного имиджа.             |
                    ///--------------------------------------:
                    const sf::IntRect sourceRect
                    {   {w, h}, {(int)sz.x, (int)sz.y}
                    };

                    ///--------------------------------------|
                    /// Создаем пустой фрагмент.             |
                    ///--------------------------------------:
                    emplace_back(TaskImage(fileDest)); auto& dest = back();

                    ///--------------------------------------|
                    /// Внутри фрагмента создаем буфер.      |
                    ///--------------------------------------:
                    dest.resize({sz.x, sz.y});

                    ///--------------------------------------|
                    /// Копируем в буфер.                    |
                    ///--------------------------------------:
                    if(!dest.copy(imgSource, {0, 0}, sourceRect))
                    {
                         ASSERTM(false, "copy is failed ...")
                    }

                    if(isNeedSave)
                    {   if(!dest.saveToFile(fileDest))
                        {
                            ASSERTM(false, "saveToFile is failed ...")
                        }
                    }

                    ++cnt;
                }
            }
        }

        ///--------------------------------------|
        /// Тест разраба.                        |
        ///--------------------------------------:
        TEST
        {
            CutterImage cutterImage(true);
        }
    };

} // namespace tools

#endif // CUTTERIMG_H
