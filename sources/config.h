#ifndef CONFIG_H
#define CONFIG_H
/// "config.h"
///----------------------------------------------------------------------------|
/// ...
///----------------------------------------------------------------------------:
#include "debug.h"

#ifdef VER_EXE_BIT_32
    #define VALBIT " 32 bit."
#else
    #define VALBIT " 64 bit."
#endif

namespace win
{
    #if __has_include(<windows.h>)
        #include      <windows.h>
        void init()
        {   std::system("chcp 65001>nul");
            win::SetConsoleTitle("Debug: Pazzle384");
        //  std::system("mode 70,40");
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
    inline static constexpr char VERSION[]{"Pazzle384-ver:0.0.5.5"};

    std::string getVersion() const
    {   std::string name {VERSION};
                    name += VALBIT;
        return      name ;
    }

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
    int  depth{0};

    ///--------------------------------------|
    /// Получить существующий объект.        |
    ///--------------------------------------:
    static const Config& get(){ static const Config cfg; return cfg; }
};

#endif // CONFIG_H
