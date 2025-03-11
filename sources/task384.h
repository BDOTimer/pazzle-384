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

    using TE = TaskImage::eSIDES;

    ///--------------------------------------|
    /// Общие оценки для 4 пар сторон.       |
    ///     0, 1 для UP    и DOWN            |
    ///     2, 3 для RIGHT и LEFT            |
    ///--------------------------------------:
    std::array<float, 4> similarity;

    ///--------------------------------------|
    /// Правила коннекта - "кто с кем?".     |
    ///     первая колонка для а             |
    ///     вторая колонка для b             |
    ///--------------------------------------:
    inline static    TE  R[4][2]
    {   { TE::UP   , TE::DOWN  },
        { TE::DOWN , TE::UP    },
        { TE::RIGHT, TE::LEFT  },
        { TE::LEFT , TE::RIGHT }
    };

    ///--------------------------------------|
    /// Для пары картинок -> 4 пары сторон.  |
    ///--------------------------------------:
    void do4Similarity()
    {   unsigned  cnt{0};
        for(auto& e :   similarity)
        {         e = doSimilarity(cnt++);
        }
    }

    ///--------------------------------------|
    /// Вычисляем оценку по пикселям...      |
    ///--------------------------------------:
    float  doSimilarity(const unsigned cnt)
    {
        const Mat2dPixel& matA = a->get(R[cnt][0]);
        const Mat2dPixel& matB = b->get(R[cnt][1]);

        unsigned SS{};

        for(auto ai  = matA[0].begin(),
                 bi  = matB[0].begin();
                 ai != matA[0].end  (); ++ai, ++bi)
        {
            int N1 = int(ai->r) - bi->r; N1 *= N1;
            int N2 = int(ai->b) - bi->g; N2 *= N2;
            int N3 = int(ai->g) - bi->b; N3 *= N3;

            SS += N1 + N2 + N3;
        }

        return SS;
    }

    ///--------------------------------------|
    /// Инфа о том, что происходит...        |
    ///--------------------------------------:
    std::string debug() const
    {
        std::stringstream ss;

        ss << "1. a->filename: " << a->filename << '\n'
           << "2. a->filename: " << b->filename << '\n';

        unsigned i{};
        for(const auto similar : similarity)
        {   ss << std::format("[{}, {}]: Similar: {} %\n",
                           TaskImage::whatSIDE(R[i][0])  ,
                           TaskImage::whatSIDE(R[i][1])  ,
                           similar);
          ++i;
        }

        return ss.str();
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

            ln(front()->getSize())

            auto result = std::format("Всего расчитанны оценки для {} пар.\n"
                                     , m.size());
            ln(result)
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

            /// ASSERT((*a)->filename != (*b)->filename)
            }
        }
        ASSERT(calcElem(size()) == m.size())

        conv2persent();
    }

    ///--------------------------------------|
    /// info.                                |
    ///--------------------------------------:
    std::string info(unsigned cntMax = unsigned(-1)) const
    {
        std::stringstream ss{"Task384: ...\n"};

        unsigned cnt{};
        for(const auto& e : m)
        {
            ss << "\n///-------------------------------:" << cnt << "\n"
               << e.debug();

            if(++cnt == cntMax) break;
        }

        ss << "\n...\n\nВсего таких пар: " << m.size() << '\n';
        return ss.str();
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
    /// unsigned ---> max: 4294967296        |
    /// хватит на картинку с сайзом:         |
    /// l(4294967296 / (255 * 255 * 3)) ==   |
    ///                                22017 |
    ///--------------------------------------:
    static unsigned calcMaxSimilar(const unsigned sizePixels)
    {   return 255 * 255 * 3 * sizePixels;
    }

    ///--------------------------------------|
    /// Конверт оценок в проценты.           |
    ///--------------------------------------:
    void conv2persent()
    {
        const unsigned maxx = calcMaxSimilar(front()->getSize().x);
        const unsigned maxy = calcMaxSimilar(front()->getSize().y);

        for(auto& _2s : m)
        {
            #define S _2s.similarity

            S[0] = float(unsigned(10000 * ((maxx - S[0]) / maxx)))/100;
            S[1] = float(unsigned(10000 * ((maxx - S[1]) / maxx)))/100;

            S[2] = float(unsigned(10000 * ((maxy - S[2]) / maxy)))/100;
            S[3] = float(unsigned(10000 * ((maxy - S[3]) / maxy)))/100;

            #undef S
        }
    }

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
        ASSERT(calcElem(images.size()) == task384.m.size())

        std::cout << task384.info(20);
    }
};

#endif // IMAGES_H
