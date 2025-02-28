#ifndef CUTTERIMG_H
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
                imgSource.loadFromFile(filename);
                save2Files  (isNeedSave);
            }

    std::vector<sf::Texture>& getTextures()
    {   static std::vector<sf::Texture> tt = TaskImage::img2Txtr(*this);
        return tt;
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
            sf::Vector2i sz
            {   int(WS / ConfigCutterImg::get().WH.x),
                int(HS / ConfigCutterImg::get().WH.y)
            };

            unsigned cnt{1};

            ///--------------------------------------|
            /// Выборка фрагмента из входного имиджа.|
            ///--------------------------------------:
            for    (int h = 0, YS = int(WS); h < YS; h += sz.y)
            {   for(int w = 0, XS = int(HS); w < XS; w += sz.x)
                {
                    std::string fileDest { ConfigCutterImg::get().fileDest};
                                fileDest += std::to_string(cnt);
                                fileDest += ".png";

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
                    const sf::IntRect sourceRect{ w, h, sz.x, sz.y };

                    ///--------------------------------------|
                    /// Создаем пустой фрагмент.             |
                    ///--------------------------------------:
                    emplace_back(TaskImage(fileDest)); auto& dest = back();

                    ///--------------------------------------|
                    /// Внутри фрагмента создаем буфер.      |
                    ///--------------------------------------:
                    dest.create(sz.x, sz.y);

                    ///--------------------------------------|
                    /// Копируем в буфер.                    |
                    ///--------------------------------------:
                    dest.copy(imgSource, 0, 0, sourceRect);

                    if(isNeedSave)
                    {
                        dest.saveToFile(fileDest);
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
