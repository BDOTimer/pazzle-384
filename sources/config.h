#ifndef CONFIG_H
#define CONFIG_H
/// "config.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include "debug.h"

namespace win
{
    #if __has_include(<windows.h>)
        #include <windows.h>
        void init()
        {   std::system("chcp 65001>nul");
            win::SetConsoleTitle ("Debug view: Pazzle384");
            std::system("mode 50,40");
        }
    #else
        void init(){}
    #endif
}

///----------------------------------------------------------------------------|
/// Внимание!
/// Настройте конфиг согласно вашим хотелкам, разумеется, адекватным.
///--------------------------------------------------------------------- Config:
struct  Config
{       Config()
        {
            win::init();

            std::cout << bannerlogo();
        }
        Config          (const Config&) = delete;
        Config operator=(const Config&) = delete;

    ///--------------------------------------|
    /// Уважайте ваш код! :)                 |
    ///--------------------------------------:
    inline static constexpr char VERSION[]{"Demo::Pazzle384-ver:0.0.4.1"};

    ///--------------------------------------|
    /// Консольный баннер.                   |
    ///--------------------------------------:
    inline static std::string bannerlogo()
    {   Strv a{"///--------------------------------------|"};
        return std::format("{}\n///      {}     |\n{}\n", a,VERSION,a);
    }

    ///--------------------------------------|
    /// Фильтр поиска по расширению файлов.  |
    ///--------------------------------------:
    const std::set<std::string_view> filtr{".jpg",".png"};

    ///--------------------------------------|
    /// Базовая директория поиска.           |
    ///--------------------------------------:
    const std::array<std::string_view, 2> dirImg
    {   "./img/tsk-384/",
        "./img/gen-004-1/"
    };

    std::string_view getDirImg(unsigned i = 0) const { return dirImg[i]; }

    ///--------------------------------------|
    /// Глубина вложенности папок для поиска.|
    ///--------------------------------------:
    int  depth{1};

    ///--------------------------------------|
    /// Получить существующий объект.        |
    ///--------------------------------------:
    static const Config& get(){ static const Config cfg; return cfg; }
};

#endif // CONFIG_H
