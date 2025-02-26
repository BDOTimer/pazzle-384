#ifndef DEBUG_H
#define DEBUG_H
/// "debug.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include <filesystem> /// C++17
#include <algorithm>
#include <iostream>
#include <iterator>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <memory>
#include <format>  /// C++20
#include <vector>
#include <string>
#include <cmath>
#include <map>
#include <set>

namespace fs = std::filesystem;
void tests();

template<typename T> using Arr1d =       std::vector<T> ;
template<typename T> using Mat2d = Arr1d<std::vector<T>>;
template<typename T> using Mat3d = Mat2d<std::vector<T>>;

#define ln(a) std::cout << #a << ":\n" << (a) << '\n';
#define  l(a) std::cout << #a << ": "  << (a) << '\n';
#define TEST friend void ::tests(); static void test()

using Strv = std::string_view;

struct  Ass
{       Ass(bool pred, Strv filename, int line, Strv s = "")
        {   if(!pred)
            {   std::cout
                    << std::format("ASSERT_ERROR: FILE: \"{}\", LINE: {}, {}\n",
                            cutStr(filename), line, s);
                throw(-1);
            }
        }

    Strv cutStr(Strv s) const
    {   auto p = s.rfind("sources"); return s.substr(p, s.size() - p);
    }
};

#define  ASSERT(a)       Ass(a, __FILE__, __LINE__);
#define ASSERTM(a, mess) Ass(a, __FILE__, __LINE__, mess);
#define TRY(a) try{a;}catch(...){std::cout << "ERROR exeption: " << #a << '\n';}

#endif // DEBUG_H
