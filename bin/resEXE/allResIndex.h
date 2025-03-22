#ifndef ALL_RES_INDEX_H
#define ALL_RES_INDEX_H

/// myXXD-ver:0.2: "allResIndex.h"
///----------------------------------------------------------------------------|
/// Тут все ваши ресурсы.
///     -   данный хедер участвует в генерации libres.a
///     -   данный хедер неебходимо подключить к вашему проекту.
///     -   также необходимо подключить libres.a (с ресами внутри).
///----------------------------------------------------------------------------:
#include <vector>
#include <string>
#include <sstream>
#include <iostream>

namespace res
{
    struct Unit;

    std::string info(const std::string_view what = "");

    std::ostream& operator<<(std::ostream&, const             res::Unit  &);
    std::ostream& operator<<(std::ostream&, const std::vector<res::Unit*>&);

    struct Unit
    {
        ///-------------------|
        /// Свойства ресурса. |
        ///-------------------:
        const size_t           len ;
        const unsigned char*   data;
        const std::string_view path;

        ///-------------------|
        /// Загребущая лапа.  |
        ///-------------------:
        static std::vector<Unit*> get(const std::string_view filter);

        ///-------------------|
        /// Тест разраба.     |
        ///-------------------:
        static void test()
        {
            std::cout << info() << '\n';

            ///----------------------------------|
            /// Получаем все ресурсы сюда.       |
            ///----------------------------------:
            std::vector<res::Unit*>  res = Unit::get("");

            ///----------------------------------|
            /// Манипуляции с ними...            |
            ///----------------------------------:
            for(const auto& e : res)
            {   for(unsigned i = 0; i < 0x4FF && i < e->len; ++i)
                {   std::cout << char(e->data[i]);
                }   std::cout << '\n';
            }
        }
    };
}

#endif // header guard


