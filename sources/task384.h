#ifndef TASK384_H
#define TASK384_H
/// "task384.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:

#include <SFML/Graphics.hpp>
#include "images.h"


///-----------------------------------------------------------------------------
/// _2Sides.
///-------------------------------------------------------------------- _2Sides:
struct  _2Sides
{       _2Sides(TaskImage const* _a, TaskImage const* _b)
            : a(_a), b(_b)
        {
            do4Similarity();
        }

    ///--------------------------------------|
    /// Кто участвует?                       |
    ///--------------------------------------:
    TaskImage const* a;
    TaskImage const* b;

    ///--------------------------------------|
    /// Общие оценки для 4 пар сторон.       |
    ///--------------------------------------:
    std::array<int64_t, 4> similarity;

    ///--------------------------------------|
    /// Для пары картинок -> 4 пары сторон.  |
    ///--------------------------------------:
    void do4Similarity()
    {   unsigned  cnt{0};
        for(auto& e :   similarity)
        {         e = doSimilarity(cnt++);
        }
    }

    using TE = TaskImage::eSIDES;

    ///--------------------------------------|
    /// Правила коннекта - "кто с кем?".     |
    ///--------------------------------------:
    inline static    TE  E[4][2]
    {   { TE::UP   , TE::DOWN  },
        { TE::DOWN , TE::UP    },
        { TE::RIGHT, TE::LEFT  },
        { TE::LEFT , TE::RIGHT }
    };

    ///--------------------------------------|
    /// Вычислям оценку по пикселям...       |
    ///--------------------------------------:
    int64_t doSimilarity(const unsigned cnt)
    {
        const Mat2dPixel& matA = a->get(E[cnt][0]);
        const Mat2dPixel& matB = b->get(E[cnt][1]);

        int64_t SS{};

        for(auto ai  = matA[0].begin(),
                 bi  = matB[0].begin();
                 ai != matA[0].end(); ++ai, ++bi)
        {
            int N1 = int(ai->r) - bi->r; N1 *= N1;
            int N2 = int(ai->b) - bi->b; N2 *= N2;
            int N3 = int(ai->g) - bi->g; N2 *= N2;

            SS += N1 + N2 + N3;
        }

        return SS;
    }

    ///--------------------------------------|
    /// Инфа о том, что происходит...        |
    ///--------------------------------------:
    std::string debug() const
    {
        std::cout << "1. "; l(a->filename)
        std::cout << "2. "; l(b->filename) std::cout << '\n';

        unsigned cnt{};
        for(const auto similar : similarity)
        {   std::cout << std::format("[{}, {}]: ",
                                    TaskImage::whatSIDE(E[cnt][0]),
                                    TaskImage::whatSIDE(E[cnt][1])); ++cnt;
                     l(similar);
        }

        return "";
    }
};


///-----------------------------------------------------------------------------
/// Task384.
///-------------------------------------------------------------------- Task384:
struct  Task384 : std::vector<TaskImage const*>
{       Task384(const LoaderImages& imgs)
        {   reserve(imgs.size());
            for(const auto& e : imgs) push_back(&e);
            m.reserve(calcElem(size()));
            go();
        }

    ///--------------------------------------|
    /// Все пары, какие только есть ...      |
    ///--------------------------------------:
    void go()
    {
        for    (auto a = cbegin(), END = cend() - 1; a != END   ; ++a)
        {   for(auto b = a + 1;                      b != cend(); ++b)
            {
                m.push_back(_2Sides(*a, *b));

                ASSERT((*a)->filename != (*b)->filename)
            }
        }
            ASSERT(calcElem(384) == m.size())
    }

private:
    ///--------------------------------------|
    /// Склад для пар сторон.                |
    ///--------------------------------------:
    std::vector<_2Sides> m;

    ///--------------------------------------|
    /// Прогноз на кол-во пар.               |
    ///--------------------------------------:
    static unsigned calcElem(unsigned n){ return n * (n - 1) / 2; }

    ///--------------------------------------|
    /// Тест разраба.                        |
    ///--------------------------------------:
    TEST
    {
        LoaderImages    images ;
        Task384 task384(images);
/*
        _2Sides _2sides(task384[0], task384[1]);
                _2sides.debug();
*/
        l(calcElem(384) == task384.m.size())

        unsigned cnt{};

        for(const auto& e : task384.m)
        {
            std::cout << "\n///-------------------------------:"; l(cnt)
            e.debug();

            if(++cnt == 4) break;
        }

        std::cout << "\n...\n\nВсего таких пар: " << task384.m.size() << '\n';
    }
};

#endif // IMAGES_H
