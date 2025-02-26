#ifndef FILES_CARGO_H
#define FILES_CARGO_H
/// "files-cargo.h"
///-----------------------------------------------------------------------------
/// Файловый коллектор.
///     -   как испльзовать смотрим тест.
///----------------------------------------------------------------------------:
#include "debug.h"

namespace win
{
    #include <windows.h>
}

///----------------------------------------------------------------------------|
/// Внимание!
/// Настройте конфиг согласно вашим хотелкам, разумеется, адекватным.
///--------------------------------------------------------------------- Config:
struct  Config
{       Config()
        {   std::system("chcp 65001>nul");
            std::cout << std::format(BORDER, VERSION) << '\n';

            win::SetConsoleTitle ("Debug view: Pazzle384");
        }
        Config          (const Config&) = delete;
        Config operator=(const Config&) = delete;

    ///--------------------------------------|
    /// Уважайте ваш код! :)                 |
    ///--------------------------------------:
    inline static constexpr char VERSION[]{"Demo::Pazzle384-ver:0.0.4"};
    inline static constexpr char BORDER []{R"(
///--------------------------------------|
///      {}       |
///--------------------------------------|
)"};

    ///--------------------------------------|
    /// Фильтр поиска по расширению файлов.  |
    ///--------------------------------------:
    const std::set<std::string_view> filtr{".jpg",".png"};

    ///--------------------------------------|
    /// Базовая директория поиска.           |
    ///--------------------------------------:
/// const std::string_view dirSource{"./images/" };
    const std::string_view dirSource{"./genTest/"};

    ///--------------------------------------|
    /// Глубина вложенности папок для поиска.|
    ///--------------------------------------:
    int  depth{1};

    ///--------------------------------------|
    /// Получить существующий объект.        |
    ///--------------------------------------:
    static const Config& get(){ static const Config cfg; return cfg; }
};

using MapPath = std::map<std::string, std::vector<fs::path>>;

///----------------------------------------------------------------------------|
/// FilesCargo.
///----------------------------------------------------------------- FilesCargo:
struct  FilesCargo : protected MapPath
{       FilesCargo()
        {
            for(const auto& ext : Config::get().filtr)
            {   (*this)[ext.data()] = std::vector<fs::path>();
            }
            scan();
        }

    ///--------------------------------------|
    /// Получить массив директорий к файлам. |
    ///--------------------------------------:
    const std::vector<fs::path>& get(std::string_view ext) const
    {   static std::vector<fs::path> nul;
        if(const auto it = this->find(ext.data()); it != cend())
        {   return it->second;
        }
        return nul;
    }

    ///--------------------------------------|
    /// Получить отчёт.                      |
    ///--------------------------------------:
    std::string debug() const
    {   std::stringstream ss;

        ss << "|------------------ FilesCargo:\n";

        unsigned cnt = 0;

        for(auto&[exten, vecPath] : *this)
        {
            ss << "  \\---------------- " << exten << ":\n";

            for(const auto& path : vecPath)
            {   ss << "    " << path.string() << '\n'; ++cnt;

                if(cnt > 10)
                {   ss << "    " << "и так далее ...\n    ...\n";
                    break;
                }
            }
        }

        if(0 == cnt)
        {    ss.str("");
             ss << "  WARNING: Файлы из фильтра конфига отсутсвуют ...\n";
        }
        else ss << "  Всего файлов: " << cntFiles() << '\n';

        return ss.str();
    }

    ///--------------------------------------|
    /// Тест разраба.                        |
    ///--------------------------------------:
    static void test()
    {   FilesCargo   filesCargo;
        std::cout << filesCargo.debug() << '\n';
    }

    ///--------------------------------------|
    /// Этот м. тут случайно затесался.      |
    ///--------------------------------------:
    static void remove(const fs::path& path)
    {   fs::remove(path);
    }

    ///--------------------------------------|
    /// Кол-во найденных файлов по фильтру.  |
    ///--------------------------------------:
    size_t cntFiles() const
    {   size_t cnt{0};
        for(const auto&[ext, vecpath] : *this) cnt += vecpath.size();
        return cnt;
    }

private:
    ///--------------------------------------|
    /// Для удобства.                        |
    ///--------------------------------------:
    inline static const Config& cfg{Config::get()};

    ///--------------------------------------|
    /// Поиск согласно конфигу.              |
    ///--------------------------------------:
    void scan()
    {
        const auto& spd = fs::directory_options::skip_permission_denied;

        const fs::recursive_directory_iterator START(cfg.dirSource, spd);
        const fs::recursive_directory_iterator END  {};

        for (auto ifile  = START; ifile != END; ++ifile)
        {
            if(ifile.depth() > cfg.depth)
            {   ifile.pop( );

                if(ifile == END) break;
            }

            const auto& ext = ifile->path().extension().string();

            if(auto i = cfg.filtr.find(ext); cfg.filtr.end() != i)
            {
                if(auto it = this->find(ext); it != this->end())
                {
                    it->second.push_back(ifile->path());
                }
            }
        }
    }
};

///----------------------------------------------------------------------------|
/// Если, вдруг, захотца добавить ваши фичи, то, пжлста, вам сюды.
///----------------------------------------------------------- CastomFilesCargo:
struct CastomFilesCargo : FilesCargo
{
    static void test()
    {   FilesCargo  filesCargo;
                    ln(filesCargo.debug())

        l(filesCargo.get(".xxx").size())
        l(filesCargo.get(".png").size())
    }
};

#endif // FILES_CARGO_H
